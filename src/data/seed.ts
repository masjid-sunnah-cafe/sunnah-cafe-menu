import type { Dish } from '../lib/types'
import dishes from './dishes.json'

function bilingual<T>(field: Record<'EN' | 'FI', T>) {
	return { EN: field.EN, FI: field.FI }
}

/**
 * Bundled seed dishes used as the demo-mode browser fallback.
 */
export const SEED_DISHES: Dish[] = (dishes as unknown as Dish[]).map((dish) => ({
	...dish,
	name: bilingual(dish.name),
	subtitle: bilingual(dish.subtitle),
	description: bilingual(dish.description),
	longDescription: bilingual(dish.longDescription),
	ingredients: bilingual(dish.ingredients),
	allergens: dish.allergens.map((allergen) => ({ ...allergen, label: bilingual(allergen.label) })),
	meta: {
		...dish.meta,
		spice: dish.meta.spice ? bilingual(dish.meta.spice) : null,
	},
}))
