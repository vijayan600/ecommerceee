import os
from typing import Dict

from dotenv import load_dotenv, find_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

load_dotenv(find_dotenv())

JWT_SECRET = os.getenv('JWT_SECRET', 'your_jwt_secret_here')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalid or expired')

    user_id = payload.get('sub')
    role = payload.get('role')

    if not user_id or not role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token invalid or expired')

    return {'user_id': str(user_id), 'role': role}


async def get_admin_user(current: Dict[str, str] = Depends(get_current_user)) -> Dict[str, str]:
    if current.get('role') != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Admin access required')
    return current


async def get_logged_in_user(current: Dict[str, str] = Depends(get_current_user)) -> Dict[str, str]:
    if current.get('role') != 'user':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User access required')
    return current

