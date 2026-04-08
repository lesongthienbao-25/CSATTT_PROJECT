from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import auth, hr, products, it_tools

app = FastAPI(
    title="NexTrade Corp — Internal Portal API",
    description="Hệ thống quản lý nội bộ NexTrade Co.",
    version="1.0.0",
)

# CORS — mở rộng để frontend gọi được
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # không giới hạn origin (cố ý để CSRF demo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (uploads)
os.makedirs("/app/static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="/app/static"), name="static")

# Đăng ký routers
app.include_router(auth.router,      prefix="/api/auth",     tags=["Auth"])
app.include_router(hr.router,        prefix="/api/hr",       tags=["HR"])
app.include_router(products.router,  prefix="/api/products", tags=["Products"])
app.include_router(it_tools.router,  prefix="/api/it",       tags=["IT Tools"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "NexTrade Corp Portal"}