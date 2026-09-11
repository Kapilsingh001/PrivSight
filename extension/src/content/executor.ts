/**
 * Executes a backend action against the current page.
 *
 * Phase 1 supports only "click". Other action types are acknowledged but
 * not performed, so the pipeline reports clearly instead of failing silently.
 */

import type { ActionResponse } from "../shared/contract";
import type { ExecuteActionResult } from "../shared/messages";
import { findElementByPsId } from "./element-ids";

export function executeAction(action: ActionResponse): ExecuteActionResult {
  switch (action.action) {
    case "click":
      return clickTarget(action.target);
    case "done":
      return { ok: true, message: "Task reported as done" };
    default:
      return { ok: false, message: `Action "${action.action}" is not supported in Phase 1` };
  }
}

function clickTarget(target: string | null | undefined): ExecuteActionResult {
  if (!target) {
    return { ok: false, message: "Click action has no target" };
  }

  const element = findElementByPsId(target);
  if (!element) {
    return { ok: false, message: `No element found with data-ps-id="${target}"` };
  }

  element.scrollIntoView({ block: "center" });
  element.click();
  return { ok: true, message: `Clicked ${target}` };
}
