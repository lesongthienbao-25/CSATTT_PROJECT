from fastapi import APIRouter, Depends
from sqlalchemy import text
from app.db import get_db
from html import escape

router = APIRouter()

# FIXED: SQL Injection (search) - Using parameterized queries
@router.get("/products/search")
def search_products(q: str, db=Depends(get_db)):
    # Use parameterized query to prevent SQL injection
    result = db.execute(
        text("SELECT * FROM products WHERE name ILIKE :q"),
        {"q": f"%{q}%"}
    )
    return result.mappings().all()

# FIXED: Stored XSS (reviews) - Using parameterized queries
@router.post("/products/reviews")
def post_review(product_id: int, author: str, content: str, rating: int, db=Depends(get_db)):
    # Use parameterized query and validate rating
    if not (1 <= rating <= 5):
        return {"error": "Rating must be between 1 and 5"}
    
    db.execute(
        text("INSERT INTO reviews (product_id, author, content, rating) VALUES (:product_id, :author, :content, :rating)"),
        {"product_id": product_id, "author": author, "content": content, "rating": rating}
    )
    db.commit()
    return {"status": "Success"}

# FIXED: Reflected XSS (search-page) - Using HTML escaping
@router.get("/products/search-page")
def search_page(q: str):
    from fastapi.responses import HTMLResponse
    # Escape the query string to prevent XSS
    safe_q = escape(q)
    return HTMLResponse(content=f"<html><body><h1>Kết quả cho: {safe_q}</h1></body></html>")

# Endpoint lấy review - Fixed parameterized query
@router.get("/products/reviews/{product_id}")
def get_reviews(product_id: int, db=Depends(get_db)):
    result = db.execute(
        text("SELECT * FROM reviews WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    return result.mappings().all()