"""Console output that cannot crash a request.

Windows consoles may use a legacy code page (cp1252); printing a rupee sign or
any other non-encodable character then raises UnicodeEncodeError inside the
request handler. Diagnostics must never take a request down with them.
"""

import sys


def make_console_tolerant() -> None:
    """Never let a legacy console code page turn a log line into a 500.

    Reconfigures stdout and stderr in place (uvicorn's log handlers share the
    same stream objects) so unencodable characters are replaced, not raised.
    """
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is None:
            continue
        try:
            reconfigure(errors="backslashreplace")
        except (ValueError, OSError):
            pass


def safe_print(text: str) -> None:
    stream = sys.stdout
    encoding = getattr(stream, "encoding", None) or "utf-8"
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode(encoding, errors="replace").decode(encoding, errors="replace"))
