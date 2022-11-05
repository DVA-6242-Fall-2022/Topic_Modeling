from fastapi import FastAPI
from dotenv import dotenv_values
from pymongo import MongoClient
from routes import router as post_router
import certifi
from fastapi.responses import RedirectResponse

config = dotenv_values(".env")


app = FastAPI()


@app.on_event("startup")
def startup_db_client():
    app.mongodb_client = MongoClient(
        config["ATLAS_URI"], tlsCAFile=certifi.where())
    app.database = app.mongodb_client[config["DB_NAME"]]
    print("Connected to the MongoDB dataset!")


@app.on_event("shutdown")
def shutdown_db_client():
    app.mongodb_client.close()


@ app.get("/")
async def redirect():
    return RedirectResponse(url='/docs')


app.include_router(post_router, tags=["posts"], prefix="/posts")
