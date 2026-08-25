export type RecipeSource = 'api' | 'user';

export interface Ingredient {
	name: string;
	measure: string;
}

export interface RecipeSummary {
	id: string; // '52772' | 'usr_{uuid}'
	source: RecipeSource;
	name: string;
	thumbnail: string | null;
	category: string | null;
	area: string | null;
}

export interface Recipe extends RecipeSummary {
	instructions: string;
	ingredients: Ingredient[];
	tags: string[];
	youtubeUrl: string | null;
	sourceUrl: string | null;
	createdAt: string; // ISO 8601, Date.prototype.toISOString()
	updatedAt: string;
}

/** What the create/edit form produces. NOT a Recipe — no id, no source, no timestamps. */
export interface RecipeInput {
	name: string;
	category: string | null;
	area: string | null;
	instructions: string;
	ingredients: Ingredient[];
}
