from fastapi import APIRouter, Form, Request
from fastapi.responses import JSONResponse, RedirectResponse
from app.db import get_raw_connection

router = APIRouter()


# ============================================================
# ENDPOINT 1 — POST /api/auth/login
# Lỗ hổng: SQL INJECTION
# Cách khai thác: username = admin'--
# Lý do: truy vấn nối chuỗi trực tiếp, không dùng parameterized query
# ============================================================
@router.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
):
    conn = get_raw_connection()
    cursor = conn.cursor()

    # VULNERABLE: nối chuỗi thẳng vào SQL
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"

    try:
        cursor.execute(query)
        user = cursor.fetchone()
    except Exception as e:
        cursor.close()
        conn.close()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "query": query}   # lộ query để dễ debug/demo
        )

    cursor.close()
    conn.close()

    if user:
        return JSONResponse(content={
            "success": True,
            "user": {
                "id":       user[0],
                "username": user[1],
                "role":     user[3],
            },
            "message": "Đăng nhập thành công"
        })
    else:
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Sai tên đăng nhập hoặc mật khẩu"}
        )


# ============================================================
# ENDPOINT 2 — POST /api/auth/transfer
# Lỗ hổng: CSRF
# Cách khai thác: tạo trang HTML ngoài tự động POST đến endpoint này
# Lý do: không có CSRF token, không kiểm tra Origin header
# ============================================================
@router.post("/transfer")
async def transfer(
    from_account: str = Form(...),
    to_account:   str = Form(...),
    amount:       int = Form(...),
):
    # VULNERABLE: không kiểm tra CSRF token, không verify Origin
    conn = get_raw_connection()
    cursor = conn.cursor()

    try:
        # Kiểm tra tài khoản nguồn tồn tại và đủ tiền
        cursor.execute(
            "SELECT id, balance, owner_name FROM accounts WHERE account_number = %s",
            (from_account,)
        )
        source = cursor.fetchone()

        if not source:
            return JSONResponse(status_code=404, content={"error": "Tài khoản nguồn không tồn tại"})

        if source[1] < amount:
            return JSONResponse(status_code=400, content={"error": "Số dư không đủ"})

        # Kiểm tra tài khoản đích
        cursor.execute(
            "SELECT id, owner_name FROM accounts WHERE account_number = %s",
            (to_account,)
        )
        dest = cursor.fetchone()

        if not dest:
            return JSONResponse(status_code=404, content={"error": "Tài khoản đích không tồn tại"})

        # Thực hiện chuyển tiền
        cursor.execute(
            "UPDATE accounts SET balance = balance - %s WHERE account_number = %s",
            (amount, from_account)
        )
        cursor.execute(
            "UPDATE accounts SET balance = balance + %s WHERE account_number = %s",
            (amount, to_account)
        )
        conn.commit()

        return JSONResponse(content={
            "success": True,
            "message": f"Chuyển {amount:,} VNĐ từ {source[2]} sang {dest[1]} thành công",
            "from":    from_account,
            "to":      to_account,
            "amount":  amount,
        })

    except Exception as e:
        conn.rollback()
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        cursor.close()
        conn.close()


# ============================================================
# ENDPOINT 3 — GET /api/auth/redirect
# Lỗ hổng: OPEN REDIRECT
# Cách khai thác: ?next=https://evil.com
# Lý do: redirect thẳng đến giá trị next mà không kiểm tra domain
# ============================================================
@router.get("/redirect")
async def open_redirect(next: str = "/dashboard"):
    # VULNERABLE: không validate xem next có phải internal URL không
    return RedirectResponse(url=next, status_code=302)