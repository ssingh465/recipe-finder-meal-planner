import { describe, expect, it } from 'vitest';
import type { RawMeal } from './raw';
import { toIngredients, toSummary, toTags } from './normalize';

function rawMeal(overrides: Partial<RawMeal> = {}): RawMeal {
	return {
		idMeal: '52772',
		strMeal: 'Teriyaki Chicken Casserole',
		strMealThumb: 'https://example.com/thumb.jpg',
		...overrides
	};
}

describe('toIngredients', () => {
	it('pairs a full run of names and measures, in order', () => {
		const raw = rawMeal({
			strIngredient1: 'Soy sauce',
			strMeasure1: '3/4 cup',
			strIngredient2: 'Water',
			strMeasure2: '1/2 cup',
			strIngredient3: 'Brown sugar',
			strMeasure3: '1/4 cup'
		});

		expect(toIngredients(raw)).toEqual([
			{ name: 'Soy sauce', measure: '3/4 cup' },
			{ name: 'Water', measure: '1/2 cup' },
			{ name: 'Brown sugar', measure: '1/4 cup' }
		]);
	});

	it('keeps only the populated indexes in a sparse run', () => {
		const raw = rawMeal({
			strIngredient1: 'Soy sauce',
			strMeasure1: '3/4 cup',
			strIngredient10: 'Garlic',
			strMeasure10: '2 cloves',
			strIngredient20: 'Salt',
			strMeasure20: 'to taste'
		});

		expect(toIngredients(raw)).toEqual([
			{ name: 'Soy sauce', measure: '3/4 cup' },
			{ name: 'Garlic', measure: '2 cloves' },
			{ name: 'Salt', measure: 'to taste' }
		]);
	});

	it('drops whitespace-only names', () => {
		const raw = rawMeal({
			strIngredient1: '   ',
			strMeasure1: '1 cup',
			strIngredient2: 'Flour',
			strMeasure2: '2 cups'
		});

		expect(toIngredients(raw)).toEqual([{ name: 'Flour', measure: '2 cups' }]);
	});

	it('returns an empty array when every ingredient slot is empty', () => {
		const raw = rawMeal({
			strIngredient1: '',
			strIngredient2: null,
			strIngredient3: undefined
		});

		expect(toIngredients(raw)).toEqual([]);
	});

	it('discards a measure with no ingredient name', () => {
		const raw = rawMeal({
			strIngredient1: '',
			strMeasure1: '1 cup',
			strIngredient2: 'Flour',
			strMeasure2: '2 cups'
		});

		expect(toIngredients(raw)).toEqual([{ name: 'Flour', measure: '2 cups' }]);
	});

	it('keeps a name with no measure, as an empty string', () => {
		const raw = rawMeal({
			strIngredient1: 'Salt',
			strMeasure1: null
		});

		expect(toIngredients(raw)).toEqual([{ name: 'Salt', measure: '' }]);
	});
});

describe('toTags', () => {
	it('splits, trims, and drops empty entries', () => {
		expect(toTags(rawMeal({ strTags: 'Pasta, Curry ,,Dinner' }))).toEqual([
			'Pasta',
			'Curry',
			'Dinner'
		]);
	});

	it('returns an empty array when tags are absent or blank', () => {
		expect(toTags(rawMeal({ strTags: null }))).toEqual([]);
		expect(toTags(rawMeal({ strTags: '' }))).toEqual([]);
	});
});

describe('toSummary', () => {
	it('coerces empty-string optional fields to null', () => {
		const summary = toSummary(rawMeal({ strCategory: '', strArea: '', strMealThumb: '' }));
		expect(summary.category).toBeNull();
		expect(summary.area).toBeNull();
		expect(summary.thumbnail).toBeNull();
	});

	it('back-fills category from context when the response omits it', () => {
		const raw = rawMeal({ strCategory: undefined, strArea: 'Japanese' });
		const summary = toSummary(raw, { category: 'Chicken' });
		expect(summary.category).toBe('Chicken');
		expect(summary.area).toBe('Japanese');
	});
});
