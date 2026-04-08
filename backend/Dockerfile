FROM python:3.10-slim

WORKDIR /app

# Install system packages (including ping)
RUN apt-get update && apt-get install -y --no-install-recommends iputils-ping && rm -rf /var/lib/apt/lists/*

# Copy và cài đặt thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code vào container
COPY . .

# Tạo thư mục tài liệu mẫu và secrets giả để demo path traversal
RUN mkdir -p /app/documents /app/secrets /app/static/uploads \
    && printf "NexTrade policy placeholder\n" > /app/documents/policy.pdf \
    && printf "Contract template placeholder\n" > /app/documents/contract_template.docx \
    && printf "Internal guidelines placeholder\n" > /app/documents/internal_guidelines.txt \
    && printf "SECRET_KEY=supersecret\nDB_PASSWORD=postgres123\n" > /app/secrets/.env

# Chạy server FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
