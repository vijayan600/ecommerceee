from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str


class UserOut(BaseModel):
    id: str = Field(..., alias='_id')
    name: str
    email: EmailStr
    phone: str
    role: str = 'user'
    created_at: Optional[datetime]
