import { useState, useEffect, useCallback } from 'react';
import { getDrinks } from '@/services/drink.service';
import type { Drink, GetDrinksParams } from '@/types/drink';
import { mapToUiCategory, type UiCategory } from '@/utils/uiCategory';

export function useDrinks(params: GetDrinksParams = {}) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    (async () => {
      try {
        const result = await getDrinks(params);
        setDrinks(result);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.category, params.subCategory, params.q]);

  useEffect(() => {
    load();
  }, [load]);

  return { drinks, isLoading, reload: load };
}

export function useDrinksByUiCategory(category: UiCategory | 'all', q: string) {
  const { drinks, isLoading, reload } = useDrinks({ q: q || undefined });
  const filtered =
    category === 'all'
      ? drinks
      : drinks.filter((d) => mapToUiCategory(d) === category);
  return { drinks: filtered, isLoading, reload };
}
