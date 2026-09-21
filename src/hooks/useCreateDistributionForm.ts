import { useState } from "react";
import { ApiError } from "../api/client";
import type { DistributionRoutingIssue } from "../api/distributions";
import { useCreateDistributionMutation } from "../queries/adminDistributions";
import {
  createEmptyEoItem,
  isDistributionFormValid,
  toCreateDistributionInput,
  type DraftEoItem,
} from "../utils/distributionForm";

export function useCreateDistributionForm() {
  const createMutation = useCreateDistributionMutation();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<DraftEoItem[]>(() => [createEmptyEoItem()]);
  const values = { title, message, items };

  const submit = async () => {
    if (!isDistributionFormValid(values) || createMutation.isPending) return;
    try {
      await createMutation.mutateAsync(toCreateDistributionInput(values));
      setTitle("");
      setMessage("");
      setItems([createEmptyEoItem()]);
    } catch {
      // The mutation exposes the server error to the form.
    }
  };

  return {
    title,
    setTitle,
    message,
    setMessage,
    items,
    setItems,
    submit,
    canSubmit: isDistributionFormValid(values) && !createMutation.isPending,
    isSubmitting: createMutation.isPending,
    error: createMutation.error,
    routingIssues: getRoutingIssues(createMutation.error),
    distributions: createMutation.data?.distributions ?? [],
    dismissResult: createMutation.reset,
  };
}

function getRoutingIssues(error: unknown): DistributionRoutingIssue[] {
  if (!(error instanceof ApiError) || error.status !== 422) return [];
  if (!error.data || typeof error.data !== "object" || !("issues" in error.data)) return [];
  const issues = (error.data as { issues: unknown }).issues;
  if (!Array.isArray(issues)) return [];
  return issues.filter((issue): issue is DistributionRoutingIssue =>
    Boolean(issue)
    && typeof issue === "object"
    && typeof (issue as DistributionRoutingIssue).itemIndex === "number"
    && Number.isInteger((issue as DistributionRoutingIssue).vehicleIndex)
    && (issue as DistributionRoutingIssue).vehicleIndex >= 0
    && typeof (issue as DistributionRoutingIssue).vehicle === "string"
    && typeof (issue as DistributionRoutingIssue).eoNo === "string"
    && typeof (issue as DistributionRoutingIssue).code === "string"
    && typeof (issue as DistributionRoutingIssue).message === "string");
}
