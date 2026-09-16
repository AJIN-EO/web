import { useState } from "react";
import { getApiErrorStatus } from "../api/client";
import {
  useAddDiscussionCommentMutation,
  useDiscussionQuery,
  useReopenDiscussionMutation,
  useResolveDiscussionMutation,
} from "../queries/discussions";

export type ResolutionStatus = "modified" | "not_required";

interface UseEoDiscussionOptions {
  publicId: string;
  itemId: string;
}

export function useEoDiscussion({ publicId, itemId }: UseEoDiscussionOptions) {
  const discussionQuery = useDiscussionQuery(publicId, itemId);
  const commentMutation = useAddDiscussionCommentMutation(publicId, itemId);
  const resolveMutation = useResolveDiscussionMutation(publicId, itemId);
  const reopenMutation = useReopenDiscussionMutation(publicId, itemId);
  const [comment, setComment] = useState("");
  const [resolutionStatus, setResolutionStatus] = useState<ResolutionStatus>("modified");
  const [resolutionReason, setResolutionReason] = useState("");

  const discussion = discussionQuery.data?.discussion;
  const mutationError = commentMutation.error ?? resolveMutation.error ?? reopenMutation.error;
  const isMutating = commentMutation.isPending || resolveMutation.isPending || reopenMutation.isPending;

  const resetMutationErrors = () => {
    commentMutation.reset();
    resolveMutation.reset();
    reopenMutation.reset();
  };

  const submitComment = async () => {
    const body = comment.trim();
    if (!discussion || !body) return;
    resetMutationErrors();
    try {
      await commentMutation.mutateAsync({ expectedVersion: discussion.version, body });
      setComment("");
    } catch {
      // The mutation error is exposed to the view. A 409 refreshes in the query layer.
    }
  };

  const submitResolution = async () => {
    const reason = resolutionReason.trim();
    if (!discussion || (resolutionStatus === "not_required" && !reason)) return;
    resetMutationErrors();
    try {
      await resolveMutation.mutateAsync({
        expectedVersion: discussion.version,
        status: resolutionStatus,
        ...(reason ? { reason } : {}),
      });
      setResolutionReason("");
    } catch {
      // The mutation error is exposed to the view. A 409 refreshes in the query layer.
    }
  };

  const reopen = async () => {
    if (!discussion) return;
    resetMutationErrors();
    try {
      await reopenMutation.mutateAsync({ expectedVersion: discussion.version });
    } catch {
      // The mutation error is exposed to the view. A 409 refreshes in the query layer.
    }
  };

  return {
    discussion,
    events: discussionQuery.data?.events ?? [],
    isLoading: discussionQuery.isLoading,
    loadError: discussionQuery.error,
    isRefreshing: discussionQuery.isFetching,
    refresh: discussionQuery.refetch,
    isMutating,
    mutationError,
    isConflict: getApiErrorStatus(mutationError) === 409,
    comment: {
      value: comment,
      setValue: setComment,
      canSubmit: Boolean(comment.trim()) && !isMutating,
      isSubmitting: commentMutation.isPending,
      submit: submitComment,
    },
    resolution: {
      status: resolutionStatus,
      setStatus: setResolutionStatus,
      reason: resolutionReason,
      setReason: setResolutionReason,
      reasonRequired: resolutionStatus === "not_required",
      canSubmit: !isMutating && (resolutionStatus !== "not_required" || Boolean(resolutionReason.trim())),
      isSubmitting: resolveMutation.isPending,
      submit: submitResolution,
    },
    reopen: {
      isSubmitting: reopenMutation.isPending,
      submit: reopen,
    },
  };
}
