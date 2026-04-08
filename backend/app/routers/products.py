from fastapi import APIRouter, Depends
from sqlalchemy import text
from app.db import get_db

router = APIRouter()

# Vuln 1: SQL Injection (search) - Nối chuỗi trực tiếp [cite: 214, 216]
@router.get("/api/products/search")
def search_products(q: str, db=Depends(get_db)):
    query = f"SELECT * FROM products WHERE name LIKE '%{q}%'" 
    result = db.execute(text(query))
    return result.mappings().all()

# Vuln 2: Stored XSS (reviews) - Không lọc nội dung [cite: 219, 221]
@router.post("/api/products/reviews")
def post_review(product_id: int, author: str, content: str, rating: int, db=Depends(get_db)):
    query = f"INSERT INTO reviews (product_id, author, content, rating) VALUES ({product_id}, '{author}', '{content}', {rating})"
    db.execute(text(query))
    db.commit()
    return {"status": "Success"}

# Vuln 3: Reflected XSS (search-page) - Nhúng thẳng vào HTML [cite: 223, 225]
@router.get("/api/products/search-page")
def search_page(q: str):
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=f"<html><body><h1>Kết quả cho: {q}</h1></body></html>")

# Endpoint lấy review (không vuln nhưng cần để hiển thị) [cite: 227]
@router.get("/api/products/reviews/{product_id}")
def get_reviews(product_id: int, db=Depends(get_db)):
    result = db.execute(text(f"SELECT * FROM reviews WHERE product_id = {product_id}"))
    return result.mappings().all()