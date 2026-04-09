from fastapi import APIRouter, Depends, Query
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
@router.get("/products")
def get_products(
    category: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
    sort: str = Query("newest", regex="^(newest|price_asc|price_desc|rating)$"),
    db=Depends(get_db)
):
    """
    Endpoint: GET /api/products
    Advanced product listing with filtering and sorting
    
    Query params:
    - category: filter by category name
    - min_price: minimum price (inclusive)
    - max_price: maximum price (inclusive)
    - sort: newest|price_asc|price_desc|rating
    """
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
    
    # Sort options
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
@router.get("/products/{product_id}")
def get_product_detail(product_id: int, db=Depends(get_db)):
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
# Users can inject OS commands via the 'warehouse' parameter
@router.get("/products/{product_id}/stock/check")
def check_stock(product_id: int, warehouse: str = Query(None), db=Depends(get_db)):
    """
    VULNERABLE TO: OS Command Injection
    
    The 'warehouse' parameter is directly used in system commands.
    Example attack: 
    - /products/1/stock/check?warehouse=HN-W01; cat /etc/passwd
    - /products/1/stock/check?warehouse=HN-W01 && whoami
    
    This is intentional for security pentesting/education purposes.
    """
    query = """
        SELECT i.id, i.product_id, i.region, i.warehouse_code, i.quantity, 
               i.reorder_level, p.name, p.price
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        WHERE i.product_id = :product_id
    """
    params = {"product_id": product_id}
    
    if warehouse:
        # VULNERABLE: Direct subprocess call with unsanitized input
        # This allows OS command injection
        try:
            # Simulate warehouse API call with injected command
            cmd = f"echo 'Checking warehouse: {warehouse}'"
            # Attacker can break out with ; or && or | 
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
@router.get("/products/{product_id}/stock/region")
def get_stock_by_region(product_id: int, region: str = Query(None), db=Depends(get_db)):
    """
    Get inventory data grouped by region
    Params: region (optional) - filter by specific region
    """
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
@router.get("/products/{product_id}/regions")
def get_product_regions(product_id: int, db=Depends(get_db)):
    """Get all available regions and total stock for a product"""
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
    """Get user's shopping cart"""
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
    """Add product to cart"""
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
    """Update cart item quantity"""
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
    """Remove product from cart"""
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
    """Clear entire cart"""
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
    """Get user's wishlist"""
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
    """Add product to wishlist"""
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
    """Remove product from wishlist"""
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
    """Check if product is in wishlist"""
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

@router.get("/products/{product_id}/reviews")
def get_reviews(product_id: int, db=Depends(get_db)):
    """Get reviews for a product"""
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

@router.post("/products/{product_id}/reviews")
def post_review(product_id: int, author: str, content: str, rating: int, db=Depends(get_db)):
    """VULNERABLE TO: Stored XSS - No HTML escaping
    
    Example attack: 
    - author: <img src=x onerror=alert('XSS')>
    - content: <script>fetch('/steal-data')</script>
    
    This is intentional for security pentesting purposes.
    """
    if not (1 <= rating <= 5):
        return {"error": "Rating must be between 1 and 5"}
    
    try:
        db.execute(
            text("""
                INSERT INTO reviews (product_id, author, content, rating)
                VALUES (:product_id, :author, :content, :rating)
            """),
            {"product_id": product_id, "author": author, "content": content, "rating": rating}
        )
        db.commit()
        
        # Update product rating
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
        
        return {"status": "Review posted"}
    except Exception as e:
        return {"error": str(e)}

# ============================================
# SEARCH ENDPOINT (VULNERABLE TO SQL INJECTION)
# ============================================

@router.get("/products/search")
def search_products(q: str = Query(...), db=Depends(get_db)):
    """
    VULNERABLE TO: SQL Injection via search parameter
    
    Example attacks:
    - q: test' UNION SELECT password FROM users WHERE '1'='1
    - q: test' OR '1'='1' --
    
    The search is NOT using parameterized queries, allowing direct SQL injection.
    This is intentional for security pentesting/education purposes.
    """
    try:
        # VULNERABLE: Direct query concatenation
        # NO parameterized query - allows SQL injection
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