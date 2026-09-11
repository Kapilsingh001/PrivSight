/**
 * Service worker. Orchestrates one run:
 *   popup -> extract page -> POST /reason -> execute action -> popup status
 */

import type { ActionResponse, ReasonRequest } from "../shared/contract";
import type {
  ContentMessage,
  ExecuteActionResult,
  ExtractPageResult,
  RuntimeMessage,
  StatusMessage,
} from "../shared/messages";
import { postReason } from "./api";

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  if (message.type !== "RUN_TASK") return;

  runTask(message.task)
    .then(() => sendResponse({ ok: true }))
    .catch((error: unknown) => {
      const text = error instanceof Error ? error.message : String(error);
      reportStatus(text, "error");
      sendResponse({ ok: false, error: text });
    });

  return true; // keep the message channel open for the async response
});

async function runTask(task: string): Promise<void> {
  const tabId = await getActiveTabId();
  await ensureContentScript(tabId);

  reportStatus("Extracting page information...");
  const extracted = await sendToContent<ExtractPageResult>(tabId, { type: "EXTRACT_PAGE" });
  if (!extracted.ok) throw new Error(`Page extraction failed: ${extracted.error}`);

  const request: ReasonRequest = { task, page: extracted.page };
  reportStatus(`Extracted ${request.page.elements.length} interactive elements`);

  reportStatus("Sending request to backend...");
  const action = await postReason(request);
  reportStatus("Connected to backend", "success");
  reportStatus(`Action received: ${describeAction(action)}`);

  const result = await sendToContent<ExecuteActionResult>(tabId, { type: "EXECUTE_ACTION", action });
  if (!result.ok) throw new Error(`Action failed: ${result.message}`);

  reportStatus(`Action executed: ${result.message}`, "success");
}

async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab found");
  return tab.id;
}

/**
 * Tabs opened before the extension was loaded will not have the content
 * script yet. Ping it and inject on demand if there is no listener.
 */
async function ensureContentScript(tabId: number): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "EXTRACT_PAGE" } satisfies ContentMessage);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: contentScriptFiles() });
  }
}

function contentScriptFiles(): string[] {
  return chrome.runtime.getManifest().content_scripts?.[0]?.js ?? [];
}

function sendToContent<T>(tabId: number, message: ContentMessage): Promise<T> {
  return chrome.tabs.sendMessage(tabId, message) as Promise<T>;
}

function reportStatus(text: string, level: StatusMessage["level"] = "info"): void {
  const status: StatusMessage = { type: "STATUS", text, level };
  // The popup may have been closed; ignore "no receiver" errors.
  chrome.runtime.sendMessage(status).catch(() => undefined);
}

function describeAction(action: ActionResponse): string {
  return action.target ? `${action.action} ${action.target}` : action.action;
}
