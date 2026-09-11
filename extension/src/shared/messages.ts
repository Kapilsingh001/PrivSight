/**
 * Internal messages passed between popup, service worker and content script.
 * These never leave the browser. The wire contract lives in contract.ts.
 */

import type { ActionResponse, PageInfo } from "./contract";

/** Popup -> service worker */
export interface RunTaskMessage {
  type: "RUN_TASK";
  task: string;
}

/** Service worker -> content script */
export interface ExtractPageMessage {
  type: "EXTRACT_PAGE";
}

/** Service worker -> content script */
export interface ExecuteActionMessage {
  type: "EXECUTE_ACTION";
  action: ActionResponse;
}

/** Service worker -> popup, sent several times during one run */
export interface StatusMessage {
  type: "STATUS";
  text: string;
  level: "info" | "success" | "error";
}

export type ContentMessage = ExtractPageMessage | ExecuteActionMessage;
export type RuntimeMessage = RunTaskMessage | StatusMessage | ContentMessage;

/** Content script reply to EXTRACT_PAGE */
export type ExtractPageResult = { ok: true; page: PageInfo } | { ok: false; error: string };

/** Content script reply to EXECUTE_ACTION */
export interface ExecuteActionResult {
  ok: boolean;
  message: string;
}
