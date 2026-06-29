import os
from datetime import datetime, timedelta

from bson import ObjectId
from dotenv import load_dotenv, find_dotenv
from fastapi import APIRouter, HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from app.database import get_db

load_dotenv(find_dotenv())

router = APIRouter(prefix='/auth', tags=['auth'])

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

JWT_SECRET = os.getenv('JWT_SECRET', 'your_jwt_secret_here')
JWT_EXPIRE_HOURS = int(os.getenv('JWT_EXPIRE_HOURS', '24'))
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', '').strip().lower()
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', '')


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_token(user_id: str, role: str) -> str:
    payload = {
        'sub': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def user_to_dict(user: dict) -> dict:
    return {
        'id': str(user['_id']) if isinstance(user.get('_id'), ObjectId) else str(user.get('_id')),
        'name': user.get('name'),
        'email': user.get('email'),
        'phone': user.get('phone'),
        'role': user.get('role', 'user'),
        'created_at': user.get('created_at'),
    }


@router.post('/register', status_code=status.HTTP_201_CREATED)
async def register_user(payload: RegisterRequest):
    db = await get_db()
    users_collection = db.users
    email = payload.email.strip().lower()

    existing_user = await users_collection.find_one({'email': email})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')

    user_document = {
        'name': payload.name.strip(),
        'email': email,
        'phone': payload.phone.strip(),
        'password': hash_password(payload.password),
        'role': 'user',
        'created_at': datetime.utcnow(),
    }

    inserted_user = await users_collection.insert_one(user_document)
    token = create_token(str(inserted_user.inserted_id), 'user')

    return {
        'token': token,
        'role': 'user',
        'user': {
            'id': str(inserted_user.inserted_id),
            'name': user_document['name'],
            'email': user_document['email'],
            'phone': user_document['phone'],
            'role': 'user',
        },
    }


@router.post('/login')
async def login_user(payload: LoginRequest):
    email = payload.email.strip().lower()

    if email == ADMIN_EMAIL and payload.password == ADMIN_PASSWORD:
        token = create_token('admin', 'admin')
        return {
            'token': token,
            'role': 'admin',
            'user': {
                'id': 'admin',
                'email': ADMIN_EMAIL,
                'role': 'admin',
            },
        }

    db = await get_db()
    users_collection = db.users
    user = await users_collection.find_one({'email': email})

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')

    if not verify_password(payload.password, user['password']):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')

    token = create_token(str(user['_id']), 'user')

    return {
        'token': token,
        'role': 'user',
        'user': user_to_dict(user),
    }
