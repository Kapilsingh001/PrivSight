/**
 * Wire contract between the extension and the backend.
 *
 * Mirrors backend/app/schemas.py field for field.
 * If one side changes, the other must change with it.
 */

export type ActionType = "click" | "type" | "scroll" | "select" | "navigate" | "done";

export interface PageElement {
  /** PrivSight element identifier, stored on the element as data-ps-id. */
  id: string;
  tag: string;
  text: string;
  role: string;
}

export interface PageInfo {
  url: string;
  title: string;
  elements: PageElement[];
  text: string;
}

export interface ReasonRequest {
  task: string;
  page: PageInfo;
}

export interface ActionResponse {
  action: ActionType;
  target?: string | null;
  value?: string | null;
  confidence: number;
  reason: string;
}
