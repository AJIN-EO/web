import type { CreateDistributionInput } from "../api/distributions";

export const DEFAULT_DISTRIBUTION_TITLE = "EO 발행 알림";
export const DEFAULT_DISTRIBUTION_MESSAGE = "EO가 발생하여 안내드립니다. 확인 부탁드립니다.";

export interface DraftEoItem {
  key: string;
  vehicles: string[];
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
  vehicles: [""],
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
      vehicles: item.vehicles.map(normalizeVehicleName),
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
    && !values.title.includes("\0")
    && values.message.length <= 10_000
    && !values.message.includes("\0")
    && values.items.length >= 1
    && values.items.length <= 100
    && countEoVehiclePairs(values.items) <= 100
    && values.items.every((item) =>
      item.vehicles.length >= 1
      && item.vehicles.length <= 100
      && item.vehicles.every(isValidVehicleName)
      && !hasDuplicateVehicles(item.vehicles)
      && isValidVehicleName(item.eoNo)
      && item.itemName.trim()
      && item.itemName.length <= 5000
      && !item.itemName.includes("\0")
      && item.issueDate
      && !Number.isNaN(new Date(item.issueDate).getTime())
      && item.requirement.length <= 5000
      && !item.requirement.includes("\0")
      && item.reason.length <= 5000
      && !item.reason.includes("\0")),
  );
}

export const normalizeVehicleName = (value: string) => value.normalize("NFC").trim();
export const countEoVehiclePairs = (items: DraftEoItem[]) => items.reduce((total, item) => total + item.vehicles.length, 0);
export function hasDuplicateVehicles(vehicles: string[]) {
  const names = vehicles.map(normalizeVehicleName).filter(Boolean);
  return new Set(names).size !== names.length;
}
export function isValidVehicleName(value: string) {
  return Boolean(value.trim() && value.length <= 255 && !/[\\/\u0000-\u001f]/.test(value) && ![".", ".."].includes(value.trim()));
}
