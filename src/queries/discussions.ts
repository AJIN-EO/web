import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDiscussionComment,
  getDiscussionPage,
  reopenDiscussion,
  resolveDiscussion,
} from "../api/discussions";
import { getApiErrorStatus } from "../api/client";
import type {
  Discussion,
  DiscussionChangeResult,
  DiscussionHistory,
  DiscussionStatus,
  RequestDetail,
} from "../types/api";
import { queryKeys } from "./queryKeys";

const DISCUSSION_PAGE_SIZE = 100;

async function getDiscussionHistory(publicId: string, itemId: string) {
  let afterVersion = 0;
  let latest: DiscussionHistory | undefined;

  do {
    const page = await getDiscussionPage(
      publicId,
      itemId,
      afterVersion,
      DISCUSSION_PAGE_SIZE,
    );
    latest = {
      discussion: page.discussion,
      events: [...(latest?.events ?? []), ...page.events],
    };
    afterVersion = page.nextAfterVersion;
    if (!page.hasMore) return latest;
  } while (true);
}

export function useDiscussionQuery(publicId: string, itemId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.discussion(publicId, itemId ?? ""),
    queryFn: () => getDiscussionHistory(publicId, itemId!),
    enabled: Boolean(publicId && itemId),
  });
}

export function useAddDiscussionCommentMutation(publicId: string, itemId: string) {
  return useDiscussionMutation(publicId, itemId, ({ expectedVersion, body }: {
    expectedVersion: number;
    body: string;
  }) => addDiscussionComment(publicId, itemId, { expectedVersion, body }));
}

export function useResolveDiscussionMutation(publicId: string, itemId: string) {
  return useDiscussionMutation(publicId, itemId, ({ expectedVersion, status, reason }: {
    expectedVersion: number;
    status: Extract<DiscussionStatus, "modified" | "not_required">;
    reason?: string;
  }) => resolveDiscussion(publicId, itemId, { expectedVersion, status, reason }));
}

export function useReopenDiscussionMutation(publicId: string, itemId: string) {
  return useDiscussionMutation(publicId, itemId, ({ expectedVersion }: {
    expectedVersion: number;
  }) => reopenDiscussion(publicId, itemId, { expectedVersion }));
}

function useDiscussionMutation<TInput>(
  publicId: string,
  itemId: string,
  mutationFn: (input: TInput) => Promise<DiscussionChangeResult>,
) {
  const queryClient = useQueryClient();
  const discussionKey = queryKeys.discussion(publicId, itemId);

  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      queryClient.setQueryData<DiscussionHistory>(discussionKey, (current) => ({
        discussion: result.discussion,
        events: [...(current?.events ?? []), result.event],
      }));
      updateRequestItemCache(queryClient, publicId, itemId, result.discussion);
    },
    onError: async (error) => {
      if (getApiErrorStatus(error) === 409) {
        await queryClient.refetchQueries({ queryKey: discussionKey, type: "active" });
      }
    },
  });
}

function updateRequestItemCache(
  queryClient: ReturnType<typeof useQueryClient>,
  publicId: string,
  itemId: string,
  discussion: Discussion,
) {
  const update = (request: RequestDetail | undefined) => {
    if (!request || request.public_id !== publicId) return request;
    return {
      ...request,
      items: request.items.map((item) => item.id === itemId ? {
        ...item,
        discussion_status: discussion.status,
        discussion_version: discussion.version,
        resolution_reason: discussion.resolution_reason,
        resolved_by_id: discussion.resolved_by_id,
        resolved_at: discussion.resolved_at,
        discussion_updated_at: discussion.updated_at,
      } : item),
    };
  };

  queryClient.setQueryData<RequestDetail>(queryKeys.companyRequest(publicId), update);
  queryClient.setQueriesData<RequestDetail>(
    {
      predicate: (query) =>
        query.queryKey[0] === "admin"
        && query.queryKey[1] === "requests"
        && query.queryKey.length === 3,
    },
    update,
  );
}
