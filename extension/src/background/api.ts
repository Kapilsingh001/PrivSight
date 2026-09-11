/**
 * HTTP client for the PrivSight backend.
 */

import type { ActionResponse, ReasonRequest } from "../shared/contract";

export const BACKEND_BASE_URL = "http://localhost:8000";
const REASON_ENDPOINT = `${BACKEND_BASE_URL}/reason`;

export async function postReason(request: ReasonRequest): Promise<ActionResponse> {
  const response = await fetch(REASON_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Backend returned ${response.status}: ${body}`);
  }

  return (await response.json()) as ActionResponse;
}
