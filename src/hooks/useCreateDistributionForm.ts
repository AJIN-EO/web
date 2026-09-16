import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateDistributionMutation } from "../queries/adminDistributions";
import {
  createEmptyEoItem,
  isDistributionFormValid,
  toCreateDistributionInput,
  type DraftEoItem,
} from "../utils/distributionForm";

export function useCreateDistributionForm() {
  const navigate = useNavigate();
  const createMutation = useCreateDistributionMutation();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<DraftEoItem[]>(() => [createEmptyEoItem()]);
  const values = { title, message, items };

  const submit = async () => {
    if (!isDistributionFormValid(values) || createMutation.isPending) return;
    try {
      const { request } = await createMutation.mutateAsync(toCreateDistributionInput(values));
      navigate(`/admin/requests/${request.id}`);
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
  };
}
