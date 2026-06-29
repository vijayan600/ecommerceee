import datetime
from typing import Optional, Dict, Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl

from app.database import get_db
from app.middleware.auth_middleware import get_admin_user


router = APIRouter(prefix='/products', tags=['products'])


class ProductCreate(BaseModel):
    name: str
    image: HttpUrl
    price: float
    stock: int
    note: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str]
    image: Optional[HttpUrl]
    price: Optional[float]
    stock: Optional[int]
    note: Optional[str]
    is_available: Optional[bool]


def product_to_dict(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'id': str(doc.get('_id')),
        'name': doc.get('name'),
        'image': doc.get('image'),
        'price': doc.get('price'),
        'stock': doc.get('stock'),
        'note': doc.get('note'),
        'is_available': doc.get('is_available', True),
        'created_at': doc.get('created_at'),
    }


@router.get('/')
async def list_products():
    db = await get_db()
    products_coll = db.products
    docs = await products_coll.find({'is_available': True}).to_list(length=1000)
    products = [product_to_dict(d) for d in docs]
    return {'products': products}


@router.get('/{product_id}')
async def get_product(product_id: str):
    try:
        pid = ObjectId(product_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Product not found')

    db = await get_db()
    doc = await db.products.find_one({'_id': pid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Product not found')
    return product_to_dict(doc)


@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, admin=Depends(get_admin_user)):
    db = await get_db()
    doc = {
        'name': payload.name.strip(),
        'image': str(payload.image),
        'price': float(payload.price),
        'stock': int(payload.stock),
        'note': payload.note.strip() if payload.note else None,
        'is_available': True,
        'created_at': datetime.datetime.utcnow(),
    }
    result = await db.products.insert_one(doc)
    doc['_id'] = result.inserted_id
    return product_to_dict(doc)


@router.put('/{product_id}')
async def update_product(product_id: str, payload: ProductUpdate, admin=Depends(get_admin_user)):
    try:
        pid = ObjectId(product_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Product not found')

    update_fields = payload.dict(exclude_unset=True)
    if 'note' in update_fields and update_fields['note'] is not None:
        update_fields['note'] = update_fields['note'].strip()

    if not update_fields:
        # Nothing to update; return current product
        db = await get_db()
        existing = await db.products.find_one({'_id': pid})
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Product not found')
        return product_to_dict(existing)

    db = await get_db()
    result = await db.products.update_one({'_id': pid}, {'$set': update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Product not found')

    updated = await db.products.find_one({'_id': pid})
    return product_to_dict(updated)


@router.delete('/{product_id}')
async def delete_product(product_id: str, admin=Depends(get_admin_user)):
    try:
        pid = ObjectId(product_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Product not found')

    db = await get_db()
    result = await db.products.delete_one({'_id': pid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Product not found')

    return {'success': True, 'message': 'Product deleted'}
