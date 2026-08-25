/**
 * Shared shapes crossing the library boundary.
 *
 * `DayOfWeek` and `RecipeSummary` mirror the app's own domain types
 * (app/src/lib/domain) structurally. The library cannot import them from the
 * app — the dependency runs library -> app only (TRD §6.1) — so it declares
 * its own copies here; TypeScript's structural typing makes the app's
 * interfaces assignable to these without either package importing the other.
 *
 * `DayOption` and `PlannerEntry` have no equivalent elsewhere: they are
 * genuinely owned by the library and re-exported for the app to import.
 */

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type RecipeSource = 'api' | 'user';

export interface RecipeSummary {
  id: string;
  source: RecipeSource;
  name: string;
  thumbnail: string | null;
  category: string | null;
  area: string | null;
}

export interface DayOption {
  day: DayOfWeek;
  label: string;
  occupied: boolean;
}

export interface PlannerEntry {
  recipeId: string;
  name: string;
  thumbnail: string | null;
  resolved: boolean;
}
