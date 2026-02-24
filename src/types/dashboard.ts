import type { DrinkCategory } from './drink';

export type DashboardSummary = {
  masteredCount: number;
  totalDrinkCount: number;
  masteredRate: number;
  weeklyPracticeCount: number;
  unresolvedWrongCount: number;
  weakestCategory: DrinkCategory | null;
  weakestCategoryRate: number | null;
  latestReviewSnippet: string | null;
  latestReviewDate: string | null;
};
