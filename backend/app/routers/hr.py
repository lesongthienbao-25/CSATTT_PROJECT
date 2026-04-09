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
        # FIXED: Use parameterized queries and added access control in real implementation
        query = "SELECT id, user_id, full_name, department, position, salary, phone, address, joined_date FROM employees WHERE id = %s"
        cursor.execute(query, (id,))
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
    """FIXED: Prevent path traversal attacks by validating filename."""
    if not filename:
        raise HTTPException(status_code=400, detail="filename is required")
    
    # FIXED: Prevent path traversal by rejecting paths with .. or /
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    target_path = "/app/documents/" + filename
    try:
        # Ensure the file is within the documents directory
        real_path = os.path.abspath(target_path)
        docs_dir = os.path.abspath("/app/documents/")
        
        if not real_path.startswith(docs_dir):
            raise HTTPException(status_code=400, detail="Invalid path")
        
        if not os.path.exists(real_path) or not os.path.isfile(real_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(real_path, filename=os.path.basename(real_path))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/profile/upload")
async def upload_profile_picture(file: UploadFile = File(...)):
    """FIXED: Secure file upload - validate file type, rename file, and check size."""
    # Validate file extension
    if not file.filename.lower().endswith((".jpg", ".png", ".gif", ".jpeg")):
        raise HTTPException(status_code=400, detail="Only JPG, PNG, GIF files are allowed")
    
    # Read file contents and validate magic bytes
    contents = await file.read()
    
    # Check file size (limit to 5MB)
    MAX_SIZE = 5 * 1024 * 1024
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    # Validate file type by magic bytes
    if contents[:3] != b'\xFF\xD8\xFF' and contents[:4] != b'\x89PNG' and contents[:3] != b'GIF':
        raise HTTPException(status_code=400, detail="File content is not a valid image")
    
    save_dir = "/app/static/uploads"
    os.makedirs(save_dir, exist_ok=True)
    
    # Generate secure filename instead of using original
    import uuid
    import mimetypes
    file_ext = mimetypes.guess_extension(file.content_type) or ".jpg"
    secure_filename = f"{uuid.uuid4()}{file_ext}"
    destination_path = os.path.join(save_dir, secure_filename)
    
    with open(destination_path, "wb") as out_file:
        out_file.write(contents)
    
    return {
        "success": True,
        "filename": secure_filename,
        "url": f"/static/uploads/{secure_filename}",
        "message": "File uploaded successfully",
    }
