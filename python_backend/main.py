import os
from fastapi import FastAPI
from app.routes import model
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app = FastAPI(
    title="Backend API",
    description="Backend with static response for now, expandable for advanced features.",
    version="1.0.0"
)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(model.router)

@app.get("/")
def root():
    return {"message": "Welcome to Backend"}
