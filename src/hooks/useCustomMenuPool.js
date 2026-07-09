import { useCallback, useEffect, useState } from "react";
import settingsApi from "../services/settingsApi.js";

export function useCustomMenuPool() {
  const [customMenuPool, setCustomMenuPool] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi
      .getSection("custom_menu_pool")
      .then((response) => {
        setCustomMenuPool(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        setCustomMenuPool([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const saveCustomMenuPool = useCallback(async (nextPool) => {
    setCustomMenuPool(nextPool);
    await settingsApi.updateSection("custom_menu_pool", nextPool);
  }, []);

  const addCustomMenu = useCallback(
    async (label) => {
      const nextPool = [
        ...customMenuPool,
        {
          id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          label,
        },
      ];
      await saveCustomMenuPool(nextPool);
      return nextPool;
    },
    [customMenuPool, saveCustomMenuPool]
  );

  return {
    customMenuPool,
    loading,
    setCustomMenuPool: saveCustomMenuPool,
    addCustomMenu,
  };
}

export default useCustomMenuPool;
