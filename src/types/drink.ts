export type DrinkCategory = 'hot' | 'ice' | 'frappuccino' | 'seasonal' | 'user_limited';
export type RecipeType = 'builtin' | 'user';
export type ProgressStatus = 'not_started' | 'learning' | 'mastered';

export type Drink = {
  id: number;
  nameJa: string;
  shortCode: string | null;
  category: DrinkCategory;
  subCategory: string | null;
  needsSleeve: boolean;
  specialEquipment: string | null;
  recipeType: RecipeType;
  practiceEnabled: boolean;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  progress?: {
    status: ProgressStatus;
    correctRate: number;
  };
};

export type Step = {
  id: number;
  drinkId: number;
  stepOrder: number;
  isRequired: boolean;
  description: string;
  ingredients: Ingredient[];
};

export type Ingredient = {
  id: number;
  stepId: number;
  name: string;
  qtyShort: number | null;
  qtyTall: number | null;
  qtyGrande: number | null;
  qtyVenti: number | null;
  unit: string | null;
};

export type DrinkDetail = Drink & {
  steps: Step[];
};

export type GetDrinksParams = {
  category?: DrinkCategory | 'all';
  subCategory?: string;
  q?: string;
};
