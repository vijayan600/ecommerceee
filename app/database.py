from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)

db = client.get_default_database()


async def get_db():
    return db


async def ping_db():
    await db.command("ping")
    return db