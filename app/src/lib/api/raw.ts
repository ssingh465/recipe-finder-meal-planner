// The raw TheMealDB shape. Exists only inside lib/api/ — nothing above the adapter
// layer may import it; normalize.ts is the boundary that converts it to the domain model.

export interface RawMeal {
	idMeal: string;
	strMeal: string;
	strMealThumb: string | null;
	strCategory?: string | null; // absent from filter.php responses
	strArea?: string | null;
	strInstructions?: string | null;
	strTags?: string | null; // comma-separated, e.g. "Pasta,Curry"
	strYoutube?: string | null;
	strSource?: string | null;
	[key: `strIngredient${number}`]: string | null | undefined;
	[key: `strMeasure${number}`]: string | null | undefined;
}

export interface RawMealsResponse {
	meals: RawMeal[] | null;
}
