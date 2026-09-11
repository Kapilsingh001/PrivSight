/**
 * Content script entry point. Listens for messages from the service worker
 * and dispatches to page perception or action execution.
 */

import type { ContentMessage, ExecuteActionResult, ExtractPageResult } from "../shared/messages";
import { executeAction } from "./executor";
import { extractPageInfo } from "./perception";

chrome.runtime.onMessage.addListener(
  (message: ContentMessage, _sender, sendResponse: (r: ExtractPageResult | ExecuteActionResult) => void) => {
    switch (message.type) {
      case "EXTRACT_PAGE":
        sendResponse(handleExtractPage());
        return;
      case "EXECUTE_ACTION":
        sendResponse(executeAction(message.action));
        return;
    }
  },
);

function handleExtractPage(): ExtractPageResult {
  try {
    return { ok: true, page: extractPageInfo() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
