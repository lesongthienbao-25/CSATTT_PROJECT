from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import subprocess
from jinja2 import Template

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


@router.post("/webhook-tester")
def webhook_tester(payload: WebhookRequest):
    """
    Fetch any URL provided by the user without validation (SSRF vulnerable).
    Accepts: URL, HTTP method, optional request body.
    Returns: status code, headers, and body text.
    """
    try:
        response = requests.request(
            method=payload.method.upper(),
            url=payload.url,
            data=payload.body if payload.body else None,
            timeout=10,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "url": payload.url,
        "method": payload.method.upper(),
        "status_code": response.status_code,
        "headers": dict(response.headers),
        "body": response.text,
    }


@router.post("/network/ping")
def network_ping(payload: PingRequest):
    """
    Run ping using shell=True with raw target input.
    Accepts: target IP/hostname.
    Returns: command executed and raw output.
    """
    command = f"ping -c 4 {payload.target}"
    try:
        output = subprocess.check_output(
            command,
            shell=True,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=15,
        )
    except subprocess.CalledProcessError as exc:
        return {
            "command": command,
            "return_code": exc.returncode,
            "output": exc.output,
        }
    except subprocess.SubprocessError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "command": command,
        "return_code": 0,
        "output": output,
    }


@router.post("/reports/generate")
def generate_report(payload: ReportRequest):
    """
    Render a user-supplied Jinja2 template directly (SSTI vulnerable).
    Accepts: template string and context dictionary.
    Returns: rendered output.
    """
    try:
        template = Template(payload.template)
        rendered = template.render(payload.context)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "template": payload.template,
        "rendered": rendered,
    }
