from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import subprocess
from urllib.parse import urlparse
import re
import shlex

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
