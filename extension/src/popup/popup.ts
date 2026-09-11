/**
 * Popup script. Sends the task to the service worker and renders status lines.
 */

import type { RunTaskMessage, RuntimeMessage, StatusMessage } from "../shared/messages";

const taskInput = document.getElementById("task") as HTMLTextAreaElement;
const runButton = document.getElementById("run") as HTMLButtonElement;
const statusList = document.getElementById("status") as HTMLUListElement;

runButton.addEventListener("click", async () => {
  const task = taskInput.value.trim();
  if (!task) {
    appendStatus("Enter a task first", "error");
    return;
  }

  statusList.replaceChildren();
  runButton.disabled = true;

  const message: RunTaskMessage = { type: "RUN_TASK", task };
  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    appendStatus(error instanceof Error ? error.message : String(error), "error");
  } finally {
    runButton.disabled = false;
  }
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
  if (message.type === "STATUS") appendStatus(message.text, message.level);
});

function appendStatus(text: string, level: StatusMessage["level"]): void {
  const item = document.createElement("li");
  item.textContent = text;
  item.className = level;
  statusList.appendChild(item);
}
