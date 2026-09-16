import { http } from "./client";
import type {
  DiscussionChangeResult,
  DiscussionPage,
  DiscussionStatus,
} from "../types/api";

function discussionPath(publicId: string, itemId: string) {
  return `/api/requests/${encodeURIComponent(publicId)}/items/${encodeURIComponent(itemId)}/discussion`;
}

export function getDiscussionPage(
  publicId: string,
  itemId: string,
  afterVersion = 0,
  limit = 100,
) {
  return http.get<DiscussionPage>(discussionPath(publicId, itemId), {
    params: { afterVersion, limit },
  });
}

export function addDiscussionComment(
  publicId: string,
  itemId: string,
  input: { expectedVersion: number; body: string },
) {
  return http.post<DiscussionChangeResult>(
    `${discussionPath(publicId, itemId)}/comments`,
    input,
  );
}

export function resolveDiscussion(
  publicId: string,
  itemId: string,
  input: {
    expectedVersion: number;
    status: Extract<DiscussionStatus, "modified" | "not_required">;
    reason?: string;
  },
) {
  return http.post<DiscussionChangeResult>(
    `${discussionPath(publicId, itemId)}/resolve`,
    input,
  );
}

export function reopenDiscussion(
  publicId: string,
  itemId: string,
  input: { expectedVersion: number },
) {
  return http.post<DiscussionChangeResult>(
    `${discussionPath(publicId, itemId)}/reopen`,
    input,
  );
}
