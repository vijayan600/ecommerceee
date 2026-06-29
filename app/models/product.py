from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProductCreate(BaseModel):
    name: str
    image: str
    price: float
    stock: int
    note: Optional[str] = None
    is_available: bool = True


class ProductOut(BaseModel):
    id: str = Field(..., alias='_id')
    name: str
    image: str
    price: float
    stock: int
    note: Optional[str]
    is_available: bool
    created_at: Optional[datetime]
