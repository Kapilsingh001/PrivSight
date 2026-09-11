/**
 * Builds the PageInfo structure sent to the backend from the current DOM.
 */

import type { PageElement, PageInfo } from "../shared/contract";
import {
  PS_ID_ATTRIBUTE,
  ensureElementIds,
  findInteractiveElements,
  getAccessibleText,
} from "./element-ids";

const MAX_PAGE_TEXT_LENGTH = 20_000;
const MAX_ELEMENT_TEXT_LENGTH = 200;

export function extractPageInfo(): PageInfo {
  const interactive = findInteractiveElements();
  ensureElementIds(interactive);

  return {
    url: window.location.href,
    title: document.title,
    elements: interactive.map(toPageElement),
    text: (document.body?.innerText ?? "").trim().slice(0, MAX_PAGE_TEXT_LENGTH),
  };
}

function toPageElement(element: HTMLElement): PageElement {
  return {
    id: element.getAttribute(PS_ID_ATTRIBUTE) ?? "",
    tag: element.tagName.toLowerCase(),
    text: getAccessibleText(element).slice(0, MAX_ELEMENT_TEXT_LENGTH),
    role: element.getAttribute("role") ?? implicitRole(element),
  };
}

function implicitRole(element: HTMLElement): string {
  switch (element.tagName) {
    case "BUTTON":
      return "button";
    case "A":
      return "link";
    case "SELECT":
      return "combobox";
    case "TEXTAREA":
      return "textbox";
    case "INPUT":
      return inputRole(element as HTMLInputElement);
    default:
      return "";
  }
}

function inputRole(input: HTMLInputElement): string {
  switch (input.type) {
    case "checkbox":
      return "checkbox";
    case "radio":
      return "radio";
    case "submit":
    case "button":
      return "button";
    default:
      return "textbox";
  }
}
