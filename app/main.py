import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables before importing app modules that depend on them
load_dotenv(find_dotenv())
# Also load the backend-specific .env inside the app folder (override any root values)
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.routes.auth import router as auth_router
from app.routes.products import router as products_router
from app.routes.orders import router as orders_router
from app.routes.admin import router as admin_router
from app.routes.payment import router as payment_router

load_dotenv(find_dotenv())
# Also load the backend-specific .env inside the app folder (override any root values)
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)

app = FastAPI(title='Suguna Backend', version='1.0.0')

origins = [
    'http://localhost:5173',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://sugunawetgriender.vercel.app",  # your live frontend
        "*"  # temporary, remove after testing
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(admin_router)
app.include_router(payment_router)





@app.get('/')
async def root():
    return {'status': 'ok', 'message': 'Suguna Backend Running'}
@app.get("/health")
async def health():
    return {"ok": True}

if __name__ == '__main__':
    import uvicorn

    uvicorn.run('main:app', host='0.0.0.0', port=int(os.getenv('PORT', 8000)), reload=True)
