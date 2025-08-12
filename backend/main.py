from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_step(file: UploadFile = File(...)):
    filename = file.filename
    if not filename.lower().endswith((".step", ".stp")):
        raise HTTPException(status_code=400, detail="Only .step or .stp files are allowed")
    dest = UPLOAD_DIR / filename
    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": filename}
