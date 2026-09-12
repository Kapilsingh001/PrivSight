"""A task containing a rupee sign (or any non-cp1252 character) must never turn into a 500.

Windows consoles often run cp1252; the request log line used to raise
UnicodeEncodeError inside the handler and the extension showed
"AI service unavailable" even though the reasoner was healthy.
"""

import io
import sys

from fastapi.testclient import TestClient

from app.main import app
from app.routes import reason as reason_module
from app.safe_print import make_console_tolerant, safe_print
from app.schemas import ActionResponse

client = TestClient(app)

REQUEST = {
    "task": "Add enough quantity to the cart so that the total is approximately ₹500",
    "page": {
        "url": "https://shop.example/",
        "title": "Shop ₹",
        "elements": [{"id": "el_add", "tag": "button", "text": "Add to cart", "role": "button"}],
        "text": "Price ₹499",
    },
    "placeholders": [],
}


class _Reasoner:
    name = "stub"

    def reason(self, request):
        return ActionResponse(action="click", target="el_add", value=None, confidence=0.9, reason="₹ price matches", final=True)


def _cp1252_stdout(monkeypatch):
    buffer = io.BytesIO()
    stream = io.TextIOWrapper(buffer, encoding="cp1252", errors="strict")
    monkeypatch.setattr(sys, "stdout", stream)
    return buffer, stream


def test_reason_route_survives_rupee_sign_on_cp1252_console(monkeypatch):
    buffer, stream = _cp1252_stdout(monkeypatch)
    app.dependency_overrides[reason_module.get_reasoner] = lambda: _Reasoner()
    try:
        response = client.post("/reason", json=REQUEST)
    finally:
        app.dependency_overrides.clear()
    stream.flush()
    assert response.status_code == 200, response.text
    assert response.json()["target"] == "el_add"
    assert b"[reason] task=" in buffer.getvalue()


def test_make_console_tolerant_replaces_instead_of_raising(monkeypatch):
    buffer, stream = _cp1252_stdout(monkeypatch)
    make_console_tolerant()
    print("total ₹500")
    stream.flush()
    assert b"500" in buffer.getvalue()


def test_safe_print_never_raises(monkeypatch):
    buffer, stream = _cp1252_stdout(monkeypatch)
    safe_print("₹ ₹ ₹")
    stream.flush()
    assert buffer.getvalue()
