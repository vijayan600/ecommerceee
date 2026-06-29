from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    price_at_order: float
    quantity: int


class DeliveryAddress(BaseModel):
    full_name: str
    phone: str
    street: str
    city: str
    pincode: str


class OrderCreate(BaseModel):
    items: List[OrderItem]
    delivery_address: DeliveryAddress


class OrderOut(BaseModel):
    id: str = Field(..., alias='_id')
    user_id: str
    items: List[OrderItem]
    delivery_address: DeliveryAddress
    status: str
    payment_id: Optional[str]
    total_amount: float
    created_at: Optional[datetime]
