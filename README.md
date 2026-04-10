# NexTrade Corp — Internal Portal

A full-stack web application with React frontend, FastAPI backend, and PostgreSQL database.

## Prerequisites

- Docker & Docker Compose
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   cd CSATTT_PROJECT
   ```

2. **Build and start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Nginx Proxy: http://localhost

## Default Credentials

- **Username:** admin
- **Password:** Admin@1234

## Architecture

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL
- **Proxy:** Nginx
- **Database:** PostgreSQL

## Project Structure

```
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/# Reusable components
│   │   └── App.jsx    # Main app component
│   ├── Dockerfile
│   └── package.json
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── routers/   # API route handlers
│   │   ├── main.py    # Application entry point
│   │   └── db.py      # Database configuration
│   ├── requirements.txt
│   └── Dockerfile
├── db/                # Database initialization
│   └── init.sql       # Database schema
├── nginx/             # Nginx configuration
│   └── nginx.conf
└── docker-compose.yml # Docker compose setup
```

## Available API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Products
- `GET /api/products/search` - Search products
- `POST /api/products/reviews` - Post product review
- `GET /api/products/reviews/{product_id}` - Get product reviews

### HR
- `GET /api/hr/employees` - List all employees
- `GET /api/hr/employee?id=<id>` - Get employee details
- `GET /api/hr/documents` - List documents
- `GET /api/hr/documents/download?filename=<name>` - Download document
- `POST /api/hr/profile/upload` - Upload profile picture

### IT Tools
- `POST /api/it/webhook-tester` - Test webhook
- `POST /api/it/network/ping` - Ping a host
- `POST /api/it/reports/generate` - Generate report

## Security Improvements Made

✅ SQL Injection Prevention - All queries use parameterized statements
✅ XSS Prevention - HTML escaping for user input
✅ CSRF Protection - Proper request validation
✅ Command Injection Prevention - Input validation and safe subprocess calls
✅ File Upload Security - File type validation, size limits, secure naming
✅ Path Traversal Prevention - Path normalization and validation
✅ SSRF Prevention - URL validation for internal requests
✅ SSTI Prevention - No template rendering with user input

## Stopping the Application

```bash
docker-compose down
```

## Troubleshooting

### Port already in use
If port 3000, 8000, or 80 is already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3000:3000"  # Change first 3000 to your desired port
```

### Database connection errors
Ensure PostgreSQL container is running:
```bash
docker-compose ps
```

### Frontend not loading
Check if Node modules are installed:
```bash
docker-compose build frontend
```

## Development

To rebuild after making changes:
```bash
docker-compose up --build
```

To view logs:
```bash
docker-compose logs -f [service_name]
```

Where `[service_name]` is one of: `db`, `backend`, `frontend`, `nginx`

## License

Internal use only.
