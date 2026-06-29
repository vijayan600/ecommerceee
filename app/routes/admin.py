import datetime
from datetime import timedelta
from typing import List, Dict, Any, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.database import get_db
from app.middleware.auth_middleware import get_admin_user


router = APIRouter(prefix='/admin', tags=['admin'])


def serialize_order_admin(doc: Dict[str, Any]) -> Dict[str, Any]:
    out = dict(doc)
    out['id'] = str(out.pop('_id'))
    # user may be embedded from lookup
    user = out.get('user')
    if isinstance(user, dict):
        if isinstance(user.get('_id'), ObjectId):
            user['_id'] = str(user['_id'])
        out['user'] = {'id': user.get('_id'), 'name': user.get('name'), 'email': user.get('email')}
    # convert item product_ids
    items = []
    for it in out.get('items', []):
        item = dict(it)
        if isinstance(item.get('product_id'), ObjectId):
            item['product_id'] = str(item['product_id'])
        items.append(item)
    out['items'] = items
    return out


@router.get('/orders')
async def list_orders(status: Optional[str] = Query(None), admin=Depends(get_admin_user)):
    db = await get_db()

    pipeline = []
    # If status filter provided, match orders by status
    if status:
        pipeline.append({'$match': {'status': status}})

    # Lookup user details from users collection
    pipeline.append({
        '$lookup': {
            'from': 'users',
            'localField': 'user_id',
            'foreignField': '_id',
            'as': 'user',
        }
    })
    # Unwind user array to single object (may be empty if user removed)
    pipeline.append({'$unwind': {'path': '$user', 'preserveNullAndEmptyArrays': True}})

    # Sort newest first
    pipeline.append({'$sort': {'created_at': -1}})

    cursor = db.orders.aggregate(pipeline)
    docs = await cursor.to_list(length=1000)
    return {'orders': [serialize_order_admin(d) for d in docs]}


@router.patch('/orders/{order_id}/status')
async def update_order_status(order_id: str, payload: Dict[str, str], admin=Depends(get_admin_user)):
    new_status = payload.get('status')
    allowed = {'confirmed', 'out_for_delivery', 'delivered'}
    if new_status not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid status')

    try:
        oid = ObjectId(order_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')

    db = await get_db()
    res = await db.orders.update_one({'_id': oid}, {'$set': {'status': new_status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')

    # Return updated order with user populated
    pipeline = [
        {'$match': {'_id': oid}},
        {'$lookup': {'from': 'users', 'localField': 'user_id', 'foreignField': '_id', 'as': 'user'}},
        {'$unwind': {'path': '$user', 'preserveNullAndEmptyArrays': True}},
    ]
    doc = await db.orders.aggregate(pipeline).to_list(length=1)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')
    return serialize_order_admin(doc[0])


@router.get('/dashboard')
async def admin_dashboard(admin=Depends(get_admin_user)):
    db = await get_db()
    now = datetime.datetime.utcnow()
    start_today = datetime.datetime(now.year, now.month, now.day)
    start_7 = now - timedelta(days=7)
    start_14 = now - timedelta(days=14)
    start_month = datetime.datetime(now.year, now.month, 1)

    # today_orders: count orders created today
    pipeline_today_count = [
        # match orders created after start of today
        {'$match': {'created_at': {'$gte': start_today}}},
        {'$count': 'count'},
    ]
    today_count_res = await db.orders.aggregate(pipeline_today_count).to_list(length=1)
    today_orders = today_count_res[0]['count'] if today_count_res else 0

    # today_revenue: sum of total_amount for today
    pipeline_today_revenue = [
        {'$match': {'created_at': {'$gte': start_today}}},
        {'$group': {'_id': None, 'sum': {'$sum': '$total_amount'}}},
    ]
    t_rev = await db.orders.aggregate(pipeline_today_revenue).to_list(length=1)
    today_revenue = float(t_rev[0]['sum']) if t_rev and t_rev[0].get('sum') is not None else 0.0

    # weekly_revenue: sum for last 7 days
    pipeline_weekly = [
        {'$match': {'created_at': {'$gte': start_7}}},
        {'$group': {'_id': None, 'sum': {'$sum': '$total_amount'}}},
    ]
    w_rev = await db.orders.aggregate(pipeline_weekly).to_list(length=1)
    weekly_revenue = float(w_rev[0]['sum']) if w_rev and w_rev[0].get('sum') is not None else 0.0

    # monthly_revenue: sum for this month
    pipeline_monthly = [
        {'$match': {'created_at': {'$gte': start_month}}},
        {'$group': {'_id': None, 'sum': {'$sum': '$total_amount'}}},
    ]
    m_rev = await db.orders.aggregate(pipeline_monthly).to_list(length=1)
    monthly_revenue = float(m_rev[0]['sum']) if m_rev and m_rev[0].get('sum') is not None else 0.0

    # this_week_vs_last_week: percentage change between last 7 days and previous 7 days
    pipeline_last_week = [
        {'$match': {'created_at': {'$gte': start_14, '$lt': start_7}}},
        {'$group': {'_id': None, 'sum': {'$sum': '$total_amount'}}},
    ]
    last_week_res = await db.orders.aggregate(pipeline_last_week).to_list(length=1)
    last_week_rev = float(last_week_res[0]['sum']) if last_week_res and last_week_res[0].get('sum') is not None else 0.0

    if last_week_rev == 0.0:
        this_week_vs_last_week = None
    else:
        this_week_vs_last_week = ((weekly_revenue - last_week_rev) / last_week_rev) * 100.0

    # top_products: unwind items and aggregate counts by product_id/name
    pipeline_top_products = [
        # Break out items array
        {'$unwind': '$items'},
        # Group by product id and name, summing quantities
        {'$group': {'_id': {'product_id': '$items.product_id', 'name': '$items.name'}, 'count': {'$sum': '$items.quantity'}}},
        # Sort descending by count
        {'$sort': {'count': -1}},
        # Limit to top 5
        {'$limit': 5},
        # Project a cleaner shape
        {'$project': {'product_id': '$_id.product_id', 'name': '$_id.name', 'count': 1, '_id': 0}},
    ]
    top_products_res = await db.orders.aggregate(pipeline_top_products).to_list(length=5)
    # convert product_id ObjectIds to strings
    for p in top_products_res:
        if isinstance(p.get('product_id'), ObjectId):
            p['product_id'] = str(p['product_id'])

    # low_stock: find all products where stock < 5
    low_stock_cursor = db.products.find({'stock': {'$lt': 5}})
    low_stock_docs = await low_stock_cursor.to_list(length=100)
    low_stock = []
    for prod in low_stock_docs:
        low_stock.append({'id': str(prod.get('_id')), 'name': prod.get('name'), 'stock': prod.get('stock')})

    return {
        'today_orders': today_orders,
        'today_revenue': today_revenue,
        'weekly_revenue': weekly_revenue,
        'monthly_revenue': monthly_revenue,
        'this_week_vs_last_week': this_week_vs_last_week,
        'top_products': top_products_res,
        'low_stock': low_stock,
    }


@router.get('/customers')
async def admin_customers(admin=Depends(get_admin_user)):
    db = await get_db()

    # For each user, lookup orders summary (count and total spent)
    pipeline = [
        # Lookup orders for this user and aggregate orders count and total spent
        {
            '$lookup': {
                'from': 'orders',
                'let': {'userId': '$_id'},
                'pipeline': [
                    {'$match': {'$expr': {'$eq': ['$user_id', '$$userId']}}},
                    {'$group': {'_id': None, 'ordersCount': {'$sum': 1}, 'totalSpent': {'$sum': '$total_amount'}}},
                ],
                'as': 'orders_summary',
            }
        },
        # Project desired fields and pull first element from orders_summary
        {
            '$project': {
                'id': {'$toString': '$_id'},
                'name': 1,
                'email': 1,
                'ordersCount': {'$ifNull': [{'$arrayElemAt': ['$orders_summary.ordersCount', 0]}, 0]},
                'totalSpent': {'$ifNull': [{'$arrayElemAt': ['$orders_summary.totalSpent', 0]}, 0]},
            }
        },
    ]

    docs = await db.users.aggregate(pipeline).to_list(length=1000)
    # ensure numeric types
    for d in docs:
        d['ordersCount'] = int(d.get('ordersCount', 0))
        d['totalSpent'] = float(d.get('totalSpent', 0.0))

    return {'customers': docs}
