import type { CreateDistributionInput } from "../api/distributions";

export const DEFAULT_DISTRIBUTION_TITLE = "EO 발행 알림";
export const DEFAULT_DISTRIBUTION_MESSAGE = "EO가 발생하여 안내드립니다. 확인 부탁드립니다.";

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
  const title = values.title.trim() || DEFAULT_DISTRIBUTION_TITLE;
  const message = values.message.trim() || DEFAULT_DISTRIBUTION_MESSAGE;
  return {
    title,
    message,
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
    values.title.length <= 500
    && values.message.length <= 10_000
    && values.items.length >= 1
    && values.items.length <= 100
    && values.items.every((item) =>
      item.vehicle.trim()
      && item.vehicle.length <= 255
      && !/[\/\\\u0000-\u001f]/.test(item.vehicle)
      && item.eoNo.trim()
      && item.eoNo.length <= 255
      && !/[\/\\\u0000-\u001f]/.test(item.eoNo)
      && item.itemName.trim()
      && item.itemName.length <= 5000
      && item.issueDate
      && !Number.isNaN(new Date(item.issueDate).getTime())
      && item.requirement.length <= 5000
      && item.reason.length <= 5000),
  );
}
