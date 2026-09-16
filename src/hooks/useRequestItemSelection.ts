import { useState } from "react";
import type { EoItem } from "../types/api";

export function useRequestItemSelection(items: EoItem[] | undefined) {
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const selectedItem = items?.find((item) => item.id === selectedItemId) ?? items?.[0];

  return {
    selectedItem,
    selectItem: (item: EoItem) => setSelectedItemId(item.id),
  };
}
