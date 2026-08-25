// Single validation module, shared by create and edit. Data-quality control, not
// a security boundary — there is no trust boundary here to defend.
import type { RecipeInput } from '$lib/domain/recipe';
import type { FieldErrors } from '$lib/domain/result';

const NAME_MAX_LENGTH = 120;
const INSTRUCTIONS_MAX_LENGTH = 5000;
const INGREDIENTS_MAX_COUNT = 20;

export function validateRecipeInput(input: RecipeInput): FieldErrors {
	const errors: FieldErrors = {};

	if (!input.name.trim()) {
		errors.name = 'Enter a recipe name.';
	} else if (input.name.length > NAME_MAX_LENGTH) {
		errors.name = `Recipe name must be ${NAME_MAX_LENGTH} characters or fewer.`;
	}

	const namedIngredients = input.ingredients.filter((ingredient) => ingredient.name.trim());
	if (namedIngredients.length === 0) {
		errors.ingredients = 'Add at least one ingredient.';
	} else if (input.ingredients.length > INGREDIENTS_MAX_COUNT) {
		errors.ingredients = `Add no more than ${INGREDIENTS_MAX_COUNT} ingredients.`;
	}

	if (!input.instructions.trim()) {
		errors.instructions = 'Enter the instructions.';
	} else if (input.instructions.length > INSTRUCTIONS_MAX_LENGTH) {
		errors.instructions = `Instructions must be ${INSTRUCTIONS_MAX_LENGTH} characters or fewer.`;
	}

	return errors;
}

export function isValid(errors: FieldErrors): boolean {
	return Object.keys(errors).length === 0;
}
