from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
import requests
import subprocess
from urllib.parse import urlparse
import re
import shlex
import os

router = APIRouter()


class WebhookRequest(BaseModel):
    url: str
    method: str = "GET"
    body: str = ""


class PingRequest(BaseModel):
    target: str


class ReportRequest(BaseModel):
    template: str
    context: dict = {}


class ChatMessage(BaseModel):
    message: str


def is_valid_url(url: str) -> bool:
    """Validate URL to prevent SSRF attacks"""
    try:
        parsed = urlparse(url)
        # Allow only http and https
        if parsed.scheme not in ('http', 'https'):
            return False
        # Block private IP ranges
        if parsed.hostname:
            host = parsed.hostname.lower()
            # Block localhost and local IPs
            if host in ('localhost', '127.0.0.1', '0.0.0.0'):
                return False
            if host.startswith('192.168.') or host.startswith('10.'):
                return False
            if host.startswith('172.'):
                # Check for 172.16.0.0/12 range
                octets = host.split('.')
                if len(octets) == 4 and octets[0] == '172':
                    second = int(octets[1])
                    if 16 <= second <= 31:
                        return False
        return True
    except:
        return False


@router.post("/webhook-tester")
def webhook_tester(payload: WebhookRequest):
    """
    FIXED: Validate URLs to prevent SSRF attacks.
    """
    # Validate URL
    if not is_valid_url(payload.url):
        raise HTTPException(status_code=400, detail="Invalid or unsafe URL")
    
    try:
        response = requests.request(
            method=payload.method.upper(),
            url=payload.url,
            data=payload.body if payload.body else None,
            timeout=10,
        )
        return {
            "url": payload.url,
            "method": payload.method.upper(),
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "body": response.text,
        }
    except requests.RequestException as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/network/ping")
def network_ping(payload: PingRequest):
    """
    FIXED: Use proper argument escaping to prevent command injection.
    """
    # Validate target - only allow alphanumeric, dots, and hyphens
    if not re.match(r'^[a-zA-Z0-9.\-]+$', payload.target):
        raise HTTPException(status_code=400, detail="Invalid target format")
    
    # Use list form of subprocess to avoid shell=True vulnerability
    command = ["ping", "-c", "4", payload.target]
    try:
        output = subprocess.check_output(
            command,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=15,
        )
        return {
            "command": " ".join(command),
            "return_code": 0,
            "output": output,
        }
    except subprocess.CalledProcessError as exc:
        return {
            "command": " ".join(command),
            "return_code": exc.returncode,
            "output": exc.output,
        }
    except subprocess.SubprocessError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/reports/generate")
def generate_report(payload: ReportRequest):
    """
    FIXED: Return report as plain text instead of rendering user-supplied templates.
    Do not use Jinja2 Template rendering with user input.
    """
    try:
        # Safety: Build report from predefined templates only
        if payload.template not in ['summary', 'detailed', 'executive']:
            raise HTTPException(status_code=400, detail="Invalid template type")
        
        # Generate safe report output
        rendered = f"Report Type: {payload.template}\n"
        rendered += f"Context: {payload.context}\n"
        rendered += "Generated Report Content"
        
        return {
            "template": payload.template,
            "rendered": rendered,
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/chat/send")
def chat_send(payload: ChatMessage):
    """
    Chat endpoint with AI-like responses for common questions.
    Also vulnerable to path traversal.
    """
    message = payload.message.lower().strip()
    
    # Vulnerable: Path traversal
    if payload.message.startswith("../") or payload.message.startswith("..\\"):
        try:
            with open(payload.message, 'r') as f:
                content = f.read()
            return {"response": content}
        except Exception as e:
            # If file doesn't exist, fetch from database as fallback
            from app.db import get_raw_connection
            conn = get_raw_connection()
            cursor = conn.cursor()
            try:
                query = "SELECT id, full_name, phone, birth_date, address, birthplace FROM employees ORDER BY id"
                cursor.execute(query)
                rows = cursor.fetchall()
            except:
                cursor.close()
                conn.close()
                return {"response": f"Error: {str(e)}"}
            
            cursor.close()
            conn.close()
            
            # Format employee data
            result = "=== EMPLOYEE PRIVATE INFORMATION ===\n\n"
            for row in rows:
                result += f"ID: {row[0]}\n"
                result += f"Họ và tên: {row[1]}\n"
                result += f"Số điện thoại: {row[2]}\n"
                result += f"Ngày sinh: {row[3]}\n"
                result += f"Địa chỉ thường trú: {row[4]}\n"
                result += f"Nơi sinh: {row[5]}\n"
                result += "-" * 50 + "\n"
            
            return {"response": result}
    
    # Question 1: Product recommendations (laptops)
    if any(word in message for word in ["laptop", "máy tính xách tay", "gợi ý sản phẩm", "sản phẩm nào tốt"]):
        return {
            "response": """Dưới đây là các sản phẩm laptop phổ biến của chúng tôi:

1. **ASUS VivoBook 15** - $649
   - CPU: AMD Ryzen 5 5500U
   - RAM: 8GB DDR4
   - SSD: 512GB NVMe
   - Display: 15.6" FHD IPS
   - Phù hợp cho: Học tập, văn phòng

2. **Dell XPS 13** - $1,299
   - CPU: Intel Core i7-11th Gen
   - RAM: 16GB LPDDR5
   - SSD: 512GB PCIe NVMe
   - Display: 13.3" 4K OLED
   - Phù hợp cho: Chuyên nghiệp, thiết kế

3. **Lenovo ThinkBook 14** - $799
   - CPU: Intel Core i5-11th Gen
   - RAM: 8GB DDR4
   - SSD: 512GB SSD
   - Display: 14" FHD IPS
   - Phù hợp cho: Doanh nhân, làm việc

4. **HP Pavilion 15** - $549
   - CPU: Intel Core i5-11th Gen
   - RAM: 8GB DDR4
   - SSD: 256GB SSD
   - Display: 15.6" FHD IPS
   - Phù hợp cho: Gia đình, giải trí

💡 Bạn quan tâm đến model nào? Tôi có thể cung cấp thêm chi tiết!"""
        }
    
    # Question 2: Promotions and warranty policies
    if any(word in message for word in ["ưu đãi", "khuyến mãi", "bảo hành", "chính sách", "giá cả", "thanh toán"]):
        return {
            "response": """📢 CHƯƠNG TRÌNH ƯU ĐÃI & CHÍNH SÁCH BẢO HÀNH:

🎁 **Chương Trình Ưu Đãi:**
• Mua 2 sản phẩm được giảm 10% cho sản phẩm thứ 2
• Khách hàng thân thiết: Tích lũy điểm và nhận voucher
• Miễn phí vận chuyển cho đơn hàng từ $500
• Trả góp 0% lãi suất cho thẻ tín dụng được chọn (6-12 tháng)
• Bonus: Túi đựng laptop + Chuột không dây khi mua các dòng cao cấp

🛡️ **Chính Sách Bảo Hành:**
• Bảo hành chính hãng: 12 tháng toàn quốc
• Bảo hành mở rộng: Từ 13-36 tháng (tùy chọn)
• Bảo vệ màn hình: Thay thế miễn phí nếu bị lỗi
• Dịch vụ onsite: Sửa chữa tại chỗ trong vòng 24h
• Hỗ trợ qua điện thoại: 24/7 miễn phí
• Chính sách trả hàng: 30 ngày nếu không hài lòng

💳 **Hình Thức Thanh Toán:**
✓ Tiền mặt
✓ Chuyển khoản ngân hàng
✓ Thẻ tín dụng/Ghi nợ
✓ E-wallet (MoMo, ZaloPay, etc.)

📞 Liên hệ phòng bán hàng để biết thêm chi tiết!"""
        }
    
    # Question 3: Other branches information
    if any(word in message for word in ["chi nhánh", "cơ sở", "địa chỉ", "văn phòng", "showroom", "hệ thống"]):
        return {
            "response": """🏢 **HỆ THỐNG CHI NHÁNH NEXTRADE CORPORATION:**

📍 **Hà Nội (Trụ Sở Chính)**
   Địa chỉ: 123 Láº¡c Long QuÃ¢n, Ba Ä¬nh, Hà Nội
   Điện thoại: 0243 3210 111
   Email: hanoi@nextrade.vn
   Giờ hoạt động: 8:00 - 18:00 (T2-T7), 9:00-17:00 (CN)

🏪 **Hồ Chí Minh (Chi nhánh lớn)**
   Địa chỉ: 456 Nguyễn Hữe, Quận 1, TP.HCM
   Điện thoại: 0283 6789 222
   Email: hcm@nextrade.vn
   Giờ hoạt động: 9:00 - 19:00 (Hàng ngày)

🏢 **Đà Nẵng (Chi nhánh)**
   Địa chỉ: 789 Hàng Bạc, Cẩm Phú, Đà Nẵng
   Điện thoại: 0236 3456 333
   Email: danang@nextrade.vn
   Giờ hoạt động: 8:30 - 18:00 (T2-T7), 10:00-16:00 (CN)

💼 **Hải Phòng (Chi nhánh mới)**
   Địa chỉ: 321 Tây Sơn, Hải An, Hải Phòng
   Điện thoại: 0225 1122 444
   Email: haiphong@nextrade.vn
   Giờ hoạt động: 8:00 - 17:30 (T2-T7), Nghỉ CN

🌐 **Dịch vụ Online:**
   Website: www.nextrade.vn
   Hotline: 1900 1234 (Miễn phí)
   Chat: https://nextrade.vn/support

✨ Tất cả chi nhánh đều có đủ sản phẩm, hỗ trợ tư vấn & bảo hành!
   Bạn thích ghé thăm chi nhánh nào?"""
        }
    
    # Default response for other questions
    return {
        "response": """👋 Xin chào! Tôi là trợ lý khách hàng của NexTrade Corp.

Tôi có thể giúp bạn với:
• 💻 Gợi ý sản phẩm laptop & thiết bị công nghệ
• 🎁 Chương trình ưu đãi & khuyến mãi hiện tại
• 🛡️ Chính sách bảo hành & dịch vụ sau bán hàng
• 🏢 Thông tin về các chi nhánh của công ty
• 📞 Hỗ trợ kỹ thuật & tư vấn mua sắm

Bạn cần tìm hiểu gì? Hãy hỏi tôi!"""
    }


@router.post("/chat/upload")
async def chat_upload(file: UploadFile = File(...)):
    """
    Vulnerable: File upload with extension check only, saves with original name.
    """
    # Vulnerable: Only check extension, no content validation
    if not file.filename.lower().endswith(('.jpg', '.png', '.gif')):
        raise HTTPException(status_code=400, detail="Only JPG, PNG, GIF files are allowed")
    
    save_dir = "/app/static/uploads"
    os.makedirs(save_dir, exist_ok=True)
    
    # Vulnerable: Save with original filename
    destination = os.path.join(save_dir, file.filename)
    
    contents = await file.read()
    content_str = contents.decode('utf-8', errors='ignore')
    if file.filename.lower().endswith('php.jpg') and "<?php" in content_str and "system('id')" in content_str:
        with open(destination, "wb") as f:
            f.write(contents)
        return {
            "message": "Thông tin Account Quản trị viên\nTài khoản : admin\nMật khẩu : Admin@1234",
            "filename": file.filename,
            "path": destination
        }
    
    with open(destination, "wb") as f:
        f.write(contents)
    
    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "path": destination
    }
