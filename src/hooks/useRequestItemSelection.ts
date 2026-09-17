import { useState } from "react";
import type { EoItem } from "../types/api";

export function useRequestItemSelection(items: EoItem[] | undefined) {
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const selectedItem = items?.find((item) => item.id === selectedItemId);

  return {
    selectedItem,
    expandedItemId: selectedItem?.id,
    toggleItem: (item: EoItem) => {
      setSelectedItemId((currentItemId) => currentItemId === item.id ? undefined : item.id);
    },
  };
}
