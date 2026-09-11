"""POST /reason: receives page context and returns a browser action.

Phase 1 returns a fixed action so the extension-to-backend pipeline can be
verified end to end. Later phases replace the body of `reason` with real
decision logic while keeping the same request and response models.
"""

from fastapi import APIRouter

from app.schemas import ActionResponse, ReasonRequest

router = APIRouter()

PHASE1_ACTION = ActionResponse(
    action="click",
    target="el_buy_now",
    confidence=1.0,
    reason="Phase 1 hardcoded test action",
)


@router.post("/reason", response_model=ActionResponse)
def reason(request: ReasonRequest) -> ActionResponse:
    element_count = len(request.page.elements)
    print(f"[reason] task={request.task!r} url={request.page.url} elements={element_count}")
    return PHASE1_ACTION
