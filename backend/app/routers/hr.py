import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from app.db import get_raw_connection

router = APIRouter()


@router.get("/employee")
async def get_employee(id: int):
    """Vulnerable IDOR endpoint: trả về thông tin employee theo id mà không kiểm tra quyền."""
    conn = get_raw_connection()
    cursor = conn.cursor()

    try:
        # VULNERABLE: Không kiểm tra quyền của user, chỉ truy vấn theo id.
        query = f"SELECT id, user_id, full_name, department, position, salary, phone, address, joined_date FROM employees WHERE id = {id}"
        cursor.execute(query)
        row = cursor.fetchone()
    except Exception as exc:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(exc))

    cursor.close()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {
        "id": row[0],
        "user_id": row[1],
        "full_name": row[2],
        "department": row[3],
        "position": row[4],
        "salary": float(row[5]) if row[5] is not None else None,
        "phone": row[6],
        "address": row[7],
        "joined_date": str(row[8]) if row[8] is not None else None,
    }


@router.get("/employees")
async def list_employees():
    conn = get_raw_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id, full_name, department, position, joined_date FROM employees ORDER BY id")
        rows = cursor.fetchall()
    except Exception as exc:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(exc))

    cursor.close()
    conn.close()

    return [
        {
            "id": row[0],
            "full_name": row[1],
            "department": row[2],
            "position": row[3],
            "joined_date": str(row[4]) if row[4] is not None else None,
        }
        for row in rows
    ]


@router.get("/documents")
async def list_documents():
    conn = get_raw_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT name, filename, department, access_level FROM documents ORDER BY id")
        rows = cursor.fetchall()
    except Exception as exc:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(exc))

    cursor.close()
    conn.close()

    return [
        {
            "name": row[0],
            "filename": row[1],
            "department": row[2],
            "access_level": row[3],
        }
        for row in rows
    ]


@router.get("/documents/download")
async def download_document(filename: str):
    """Vulnerable path traversal endpoint: ghép tên file trực tiếp với /app/documents/."""
    if not filename:
        raise HTTPException(status_code=400, detail="filename is required")

    target_path = "/app/documents/" + filename
    if not os.path.exists(target_path) or not os.path.isfile(target_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(target_path, filename=os.path.basename(target_path))


@router.post("/profile/upload")
async def upload_profile_picture(file: UploadFile = File(...)):
    """Vulnerable file upload: chỉ kiểm tra phần đuôi file và lưu nguyên tên gốc."""
    if not file.filename.lower().endswith((".jpg", ".png", ".gif")):
        raise HTTPException(status_code=400, detail="Only JPG, PNG, GIF files are allowed")

    save_dir = "/app/static/uploads"
    os.makedirs(save_dir, exist_ok=True)
    destination_path = os.path.join(save_dir, file.filename)

    contents = await file.read()
    with open(destination_path, "wb") as out_file:
        out_file.write(contents)

    return {
        "success": True,
        "filename": file.filename,
        "url": f"/static/uploads/{file.filename}",
        "message": "File uploaded successfully",
    }
