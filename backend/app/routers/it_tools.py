from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import subprocess
from jinja2 import Template

router = APIRouter()


class WebhookRequest(BaseModel):
    url: str


class PingRequest(BaseModel):
    target: str
    count: int = 4


class ReportRequest(BaseModel):
    template: str
    context: dict = {}


@router.post("/webhook-tester")
def webhook_tester(payload: WebhookRequest):
    """Fetch any URL provided by the user without validation (SSRF vulnerable)."""
    try:
        response = requests.get(payload.url, timeout=10)
    except requests.RequestException as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "url": payload.url,
        "status_code": response.status_code,
        "body": response.text,
    }


@router.post("/network/ping")
def network_ping(payload: PingRequest):
    """Run ping using shell=True with raw target input (OS command injection vulnerable)."""
    command = f"ping -c {payload.count} {payload.target}"
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=15,
        )
    except subprocess.SubprocessError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "command": command,
        "return_code": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


@router.post("/reports/generate")
def generate_report(payload: ReportRequest):
    """Render a user-supplied Jinja2 template directly (SSTI vulnerable)."""
    try:
        template = Template(payload.template)
        rendered = template.render(payload.context)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "template": payload.template,
        "rendered": rendered,
    }
