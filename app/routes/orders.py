import datetime
from typing import List, Dict, Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.database import get_db
from app.middleware.auth_middleware import get_logged_in_user


router = APIRouter(prefix='/orders', tags=['orders'])


class OrderItem(BaseModel):
    product_id: str
    quantity: int


class Address(BaseModel):
    full_name: str
    phone: str
    street: str
    city: str
    pincode: str


class OrderCreate(BaseModel):
    items: List[OrderItem]
    delivery_address: Address
    payment_id: str


def order_to_dict(doc: Dict[str, Any]) -> Dict[str, Any]:
    out = dict(doc)
    out['id'] = str(out.pop('_id'))
    if isinstance(out.get('user_id'), ObjectId):
        out['user_id'] = str(out['user_id'])
    # convert product ids in items
    items = []
    for it in out.get('items', []):
        item = dict(it)
        if isinstance(item.get('product_id'), ObjectId):
            item['product_id'] = str(item['product_id'])
        items.append(item)
    out['items'] = items
    return out


@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreate, current=Depends(get_logged_in_user)):
    user_id = current.get('user_id')
    try:
        user_obj_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid user')

    db = await get_db()
    products_coll = db.products

    order_items = []
    total_amount = 0.0

    for it in payload.items:
        try:
            pid = ObjectId(it.product_id)
        except (InvalidId, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Invalid product id {it.product_id}')

        product = await products_coll.find_one({'_id': pid})
        if not product:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Product not found: {it.product_id}')

        price = float(product.get('price', 0.0))
        qty = int(it.quantity)
        snapshot = {
            'product_id': pid,
            'name': product.get('name'),
            'image': product.get('image'),
            'price': price,
            'quantity': qty,
        }
        order_items.append(snapshot)
        total_amount += price * qty

    order_doc = {
        'user_id': user_obj_id,
        'items': order_items,
        'delivery_address': payload.delivery_address.dict(),
        'payment_id': str(payload.payment_id),
        'total_amount': total_amount,
        'status': 'pending',
        'created_at': datetime.datetime.utcnow(),
    }

    res = await db.orders.insert_one(order_doc)
    order_doc['_id'] = res.inserted_id
    return order_to_dict(order_doc)


@router.get('/my-orders')
async def my_orders(current=Depends(get_logged_in_user)):
    user_id = current.get('user_id')
    try:
        user_obj_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid user')

    db = await get_db()
    cursor = db.orders.find({'user_id': user_obj_id}).sort('created_at', -1)
    docs = await cursor.to_list(length=1000)
    return {'orders': [order_to_dict(d) for d in docs]}


@router.get('/{order_id}')
async def get_order(order_id: str, current=Depends(get_logged_in_user)):
    try:
        oid = ObjectId(order_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')

    db = await get_db()
    doc = await db.orders.find_one({'_id': oid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')

    # verify ownership
    user_id = current.get('user_id')
    if str(doc.get('user_id')) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access denied')

    return order_to_dict(doc)
