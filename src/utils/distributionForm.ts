import type { CreateDistributionInput } from "../api/distributions";

export interface DraftEoItem {
  key: string;
  vehicle: string;
  eoNo: string;
  itemName: string;
  issueDate: string;
  requirement: string;
  reason: string;
}

export interface DistributionFormValues {
  title: string;
  message: string;
  items: DraftEoItem[];
}

export const createEmptyEoItem = (): DraftEoItem => ({
  key: crypto.randomUUID(),
  vehicle: "",
  eoNo: "",
  itemName: "",
  issueDate: "",
  requirement: "",
  reason: "",
});

export function toCreateDistributionInput(values: DistributionFormValues): CreateDistributionInput {
  return {
    title: values.title.trim(),
    message: values.message.trim() || null,
    items: values.items.map((item) => ({
      vehicle: item.vehicle.trim(),
      eoNo: item.eoNo.trim(),
      itemName: item.itemName.trim(),
      issueDate: new Date(item.issueDate).toISOString(),
      requirement: item.requirement.trim(),
      reason: item.reason.trim(),
    })),
  };
}

export function isDistributionFormValid(values: DistributionFormValues) {
  return Boolean(
    values.title.trim()
    && values.items.length
    && values.items.every((item) =>
      item.vehicle.trim()
      && item.eoNo.trim()
      && item.itemName.trim()
      && item.issueDate
      && !Number.isNaN(new Date(item.issueDate).getTime())
      && item.requirement.trim()
      && item.reason.trim()),
  );
}
