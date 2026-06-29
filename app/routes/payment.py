import os
import hmac
import hashlib
from typing import Optional

from dotenv import load_dotenv, find_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

# import razorpay lazily inside the handler so the app can start even if the
# razorpay SDK is not yet installed. Handlers will return a clear error
# instructing to install the package when it's missing.

from app.middleware.auth_middleware import get_logged_in_user

load_dotenv(find_dotenv())

RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', '')

router = APIRouter(prefix='/payment', tags=['payment'])


class CreateOrderRequest(BaseModel):
    amount: float
    currency: Optional[str] = 'INR'


class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post('/create-order')
async def create_order(payload: CreateOrderRequest, current=Depends(get_logged_in_user)):
    # Import razorpay lazily and return a clear error if it's not installed
    try:
        import razorpay
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Razorpay SDK not installed. Run `pip install razorpay` in your backend environment.',
        )

    # Convert rupees to paise (integer)
    try:
        amount_paise = int(round(float(payload.amount) * 100))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid amount')

    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

    order_data = {
        'amount': amount_paise,
        'currency': payload.currency,
        'payment_capture': 1,
    }

    razorpay_order = client.order.create(order_data)

    return {
        'order_id': razorpay_order.get('id'),
        'amount': razorpay_order.get('amount'),
        'currency': razorpay_order.get('currency'),
    }


@router.post('/verify')
async def verify_payment(payload: VerifyRequest, current=Depends(get_logged_in_user)):
    # Construct the message in the format razorpay expects: order_id|payment_id
    msg = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"

    # Compute HMAC SHA256 of the message using the RAZORPAY_KEY_SECRET
    computed_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode('utf-8'), msg.encode('utf-8'), hashlib.sha256
    ).hexdigest()

    # Use constant-time comparison to avoid timing attacks
    if not hmac.compare_digest(computed_signature, payload.razorpay_signature):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Payment verification failed')

    return {'verified': True, 'payment_id': payload.razorpay_payment_id}
