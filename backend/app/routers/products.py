from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import text
from app.db import get_db
from html import escape
import subprocess
import os

router = APIRouter()

# ============================================
# PRODUCTS ENDPOINTS
# ============================================

# Get all products with advanced filtering and sorting
@router.get("")
def get_products(
    category: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
    sort: str = Query("newest", regex="^(newest|price_asc|price_desc|rating)$"),
    db=Depends(get_db)
):
    query = """
        SELECT p.id, p.name, p.category_id, p.price, p.description, p.image_url, 
               p.rating, p.rating_count, p.availability_status, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    """
    params = {}
    
    if category:
        query += " AND c.name = :category"
        params["category"] = category
    
    if min_price is not None:
        query += " AND p.price >= :min_price"
        params["min_price"] = min_price
    
    if max_price is not None:
        query += " AND p.price <= :max_price"
        params["max_price"] = max_price
    
    sort_mapping = {
        "newest": "p.created_at DESC",
        "price_asc": "p.price ASC",
        "price_desc": "p.price DESC",
        "rating": "p.rating DESC"
    }
    query += f" ORDER BY {sort_mapping.get(sort, 'p.created_at DESC')}"
    
    result = db.execute(text(query), params)
    return result.mappings().all()

# Get product by ID
@router.get("/{product_id}")
def get_product_detail(product_id: int, db=Depends(get_db)):
    # VULNERABLE: IDOR - If product_id is 77, return all employee salary data
    if product_id == 77:
        from app.db import get_raw_connection
        conn = get_raw_connection()
        cursor = conn.cursor()
        try:
            query = "SELECT id, user_id, full_name, department, position, salary, phone, birth_date, address, birthplace FROM employees ORDER BY id"
            cursor.execute(query)
            rows = cursor.fetchall()
        except Exception as exc:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=500, detail=str(exc))

        cursor.close()
        conn.close()

        if rows:
            employees = []
            for row in rows:
                employees.append({
                    "id": row[0],
                    "user_id": row[1],
                    "full_name": row[2],
                    "department": row[3],
                    "position": row[4],
                    "salary": float(row[5]) if row[5] is not None else None,
                    "phone": row[6],
                    "birth_date": str(row[7]) if row[7] is not None else None,
                    "address": row[8],
                    "birthplace": row[9]
                })
            return {"employees": employees, "error": "This is all employee data leaked via IDOR!"}
        else:
            return {"error": "No employees found"}
    
    result = db.execute(
        text("""
            SELECT p.id, p.name, p.category_id, p.price, p.description, p.image_url, 
                   p.rating, p.rating_count, p.availability_status, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = :product_id
        """),
        {"product_id": product_id}
    )
    product = result.mappings().first()
    return product if product else {"error": "Product not found"}

# Get categories
@router.get("/categories")
def get_categories(db=Depends(get_db)):
    result = db.execute(text("SELECT id, name, description, icon FROM categories ORDER BY name"))
    return result.mappings().all()

# ============================================
# STOCK CHECKING ENDPOINTS (WITH INTENTIONAL VULNERABILITIES)
# ============================================

# VULNERABLE: OS Command Injection in stock check
@router.get("/{product_id}/stock/check")
def check_stock(product_id: int, warehouse: str = Query(None), db=Depends(get_db)):
    query = """
        SELECT i.id, i.product_id, i.region, i.warehouse_code, i.quantity, 
               i.reorder_level, p.name, p.price
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        WHERE i.product_id = :product_id
    """
    params = {"product_id": product_id}
    
    if warehouse:
        try:
            cmd = f"echo 'Checking warehouse: {warehouse}'"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            warehouse_info = result.stdout
        except Exception as e:
            warehouse_info = str(e)
    
    result = db.execute(text(query), params)
    stock_data = result.mappings().all()
    
    if warehouse:
        return {
            "warehouse": warehouse,
            "command_output": warehouse_info,
            "stock_data": list(stock_data)
        }
    
    return list(stock_data)

# Get stock by region
@router.get("/{product_id}/stock/region")
def get_stock_by_region(product_id: int, region: str = Query(None), db=Depends(get_db)):
    query = """
        SELECT region, warehouse_code, quantity, reorder_level
        FROM inventory
        WHERE product_id = :product_id
    """
    params = {"product_id": product_id}
    
    if region:
        query += " AND region = :region"
        params["region"] = region
    
    result = db.execute(text(query), params)
    return result.mappings().all()

# Get all regions with stock summary
@router.get("/{product_id}/regions")
def get_product_regions(product_id: int, db=Depends(get_db)):
    result = db.execute(
        text("""
            SELECT DISTINCT region, SUM(quantity) as total_quantity
            FROM inventory
            WHERE product_id = :product_id
            GROUP BY region
            ORDER BY region
        """),
        {"product_id": product_id}
    )
    return result.mappings().all()

# ============================================
# CART ENDPOINTS
# ============================================

@router.get("/cart/{user_id}")
def get_cart(user_id: int, db=Depends(get_db)):
    result = db.execute(
        text("""
            SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = :user_id
        """),
        {"user_id": user_id}
    )
    return result.mappings().all()

@router.post("/cart/{user_id}/add")
def add_to_cart(user_id: int, product_id: int, quantity: int = 1, db=Depends(get_db)):
    try:
        db.execute(
            text("""
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES (:user_id, :product_id, :quantity)
                ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = quantity + :quantity
            """),
            {"user_id": user_id, "product_id": product_id, "quantity": quantity}
        )
        db.commit()
        return {"status": "Added to cart"}
    except Exception as e:
        return {"error": str(e)}

@router.put("/cart/{user_id}/update")
def update_cart_item(user_id: int, product_id: int, quantity: int, db=Depends(get_db)):
    try:
        db.execute(
            text("""
                UPDATE cart_items SET quantity = :quantity
                WHERE user_id = :user_id AND product_id = :product_id
            """),
            {"user_id": user_id, "product_id": product_id, "quantity": quantity}
        )
        db.commit()
        return {"status": "Updated"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/cart/{user_id}/remove/{product_id}")
def remove_from_cart(user_id: int, product_id: int, db=Depends(get_db)):
    try:
        db.execute(
            text("""
                DELETE FROM cart_items
                WHERE user_id = :user_id AND product_id = :product_id
            """),
            {"user_id": user_id, "product_id": product_id}
        )
        db.commit()
        return {"status": "Removed from cart"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/cart/{user_id}/clear")
def clear_cart(user_id: int, db=Depends(get_db)):
    try:
        db.execute(
            text("DELETE FROM cart_items WHERE user_id = :user_id"),
            {"user_id": user_id}
        )
        db.commit()
        return {"status": "Cart cleared"}
    except Exception as e:
        return {"error": str(e)}

# ============================================
# WISHLIST ENDPOINTS
# ============================================

@router.get("/wishlist/{user_id}")
def get_wishlist(user_id: int, db=Depends(get_db)):
    result = db.execute(
        text("""
            SELECT w.id, w.product_id, p.name, p.price, p.image_url, p.rating
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = :user_id
            ORDER BY w.added_at DESC
        """),
        {"user_id": user_id}
    )
    return result.mappings().all()

@router.post("/wishlist/{user_id}/add")
def add_to_wishlist(user_id: int, product_id: int, db=Depends(get_db)):
    try:
        db.execute(
            text("""
                INSERT INTO wishlist (user_id, product_id)
                VALUES (:user_id, :product_id)
                ON CONFLICT (user_id, product_id) DO NOTHING
            """),
            {"user_id": user_id, "product_id": product_id}
        )
        db.commit()
        return {"status": "Added to wishlist"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/wishlist/{user_id}/remove/{product_id}")
def remove_from_wishlist(user_id: int, product_id: int, db=Depends(get_db)):
    try:
        db.execute(
            text("""
                DELETE FROM wishlist
                WHERE user_id = :user_id AND product_id = :product_id
            """),
            {"user_id": user_id, "product_id": product_id}
        )
        db.commit()
        return {"status": "Removed from wishlist"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/wishlist/{user_id}/check/{product_id}")
def is_in_wishlist(user_id: int, product_id: int, db=Depends(get_db)):
    result = db.execute(
        text("""
            SELECT id FROM wishlist
            WHERE user_id = :user_id AND product_id = :product_id
        """),
        {"user_id": user_id, "product_id": product_id}
    )
    return {"in_wishlist": result.fetchone() is not None}

# ============================================
# REVIEWS ENDPOINTS
# ============================================

@router.get("/{product_id}/reviews")
def get_reviews(product_id: int, db=Depends(get_db)):
    result = db.execute(
        text("""
            SELECT id, product_id, user_id, rating, content, author, created_at
            FROM reviews
            WHERE product_id = :product_id
            ORDER BY created_at DESC
        """),
        {"product_id": product_id}
    )
    return result.mappings().all()

from pydantic import BaseModel

class ReviewCreate(BaseModel):
    product_id: int
    author: str
    content: str
    rating: int

@router.post("/{product_id}/reviews")
def post_review(product_id: int, review_data: ReviewCreate, db=Depends(get_db)):
    """VULNERABLE TO: Stored XSS - No HTML escaping"""
    if not (1 <= review_data.rating <= 5):
        return {"error": "Rating must be between 1 and 5"}
    
    try:
        db.execute(
            text("""
                INSERT INTO reviews (product_id, author, content, rating)
                VALUES (:product_id, :author, :content, :rating)
            """),
            {
                "product_id": product_id, 
                "author": review_data.author, 
                "content": review_data.content, 
                "rating": review_data.rating
            }
        )
        db.commit()
        
        db.execute(
            text("""
                UPDATE products 
                SET rating = (
                    SELECT AVG(rating) FROM reviews WHERE product_id = :product_id
                ),
                rating_count = (
                    SELECT COUNT(*) FROM reviews WHERE product_id = :product_id
                )
                WHERE id = :product_id
            """),
            {"product_id": product_id}
        )
        db.commit()
        
        return {"status": "Review posted successfully"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/{product_id}/reviews/{review_id}")
def delete_review(product_id: int, review_id: int, db=Depends(get_db)):
    """Delete a review by ID (admin only - enforced on frontend)"""
    try:
        result = db.execute(
            text("""
                DELETE FROM reviews
                WHERE id = :review_id AND product_id = :product_id
            """),
            {"review_id": review_id, "product_id": product_id}
        )
        db.commit()

        if result.rowcount == 0:
            return {"error": "Review not found"}

        # Cập nhật lại rating của sản phẩm sau khi xóa
        db.execute(
            text("""
                UPDATE products 
                SET rating = COALESCE((
                    SELECT AVG(rating) FROM reviews WHERE product_id = :product_id
                ), 0),
                rating_count = (
                    SELECT COUNT(*) FROM reviews WHERE product_id = :product_id
                )
                WHERE id = :product_id
            """),
            {"product_id": product_id}
        )
        db.commit()

        return {"status": "Review deleted successfully"}
    except Exception as e:
        return {"error": str(e)}

# ============================================
# SEARCH ENDPOINT (VULNERABLE TO SQL INJECTION)
# ============================================

@router.get("/search")
def search_products(q: str = Query(...), db=Depends(get_db)):
    """
    VULNERABLE TO: SQL Injection via search parameter
    """
    try:
        query = f"""
            SELECT id, name, price, description, image_url, rating
            FROM products
            WHERE LOWER(name) LIKE '%{q.lower()}%' 
            OR LOWER(description) LIKE '%{q}%'
        """
        result = db.execute(text(query))
        return result.mappings().all()
    except Exception as e:
        return {"error": str(e), "sql_injection_message": "Try: ' UNION SELECT * FROM users WHERE '1'='1"}
