// Spoonacular client (server-only). Docs: https://spoonacular.com/food-api/docs
// Terms: only recipe id, title and image URL may be stored. Don't persist anything else.
// FAKE_SPOONACULAR=1 serves the synthetic fixtures in ./fixtures (0 quota points).
// If the real API reports a quota/payment problem (402/429), we fall back to the
// fixtures too, so the demo never breaks on quota.

const BASE = "https://api.spoonacular.com";

export const DIETS = [
	"gluten free",
	"ketogenic",
	"vegetarian",
	"lacto-vegetarian",
	"ovo-vegetarian",
	"vegan",
	"pescetarian",
	"paleo",
	"primal",
	"low fodmap",
	"whole30",
] as const;

export const INTOLERANCES = [
	"dairy",
	"egg",
	"gluten",
	"grain",
	"peanut",
	"seafood",
	"sesame",
	"shellfish",
	"soy",
	"sulfite",
	"tree nut",
	"wheat",
] as const;

export type RecipeSearch = {
	query?: string;
	diet?: (typeof DIETS)[number];
	intolerances?: (typeof INTOLERANCES)[number][];
	includeIngredients?: string[];
	maxReadyTime: number;
	number?: number;
};

export type RecipeOption = {
	id: number;
	title: string;
	readyInMinutes: number;
	image: string | null;
	sourceUrl: string;
	sourceName: string | null;
	macros: { calories: number | null; proteinG: number | null; carbsG: number | null; fatG: number | null };
};

export type Ingredient = { name: string; amount: number; unit: string };

type Nutrient = { name: string; amount: number };
type SearchResult = {
	id: number;
	title: string;
	readyInMinutes: number;
	image?: string;
	sourceUrl: string;
	sourceName?: string;
	nutrition?: { nutrients: Nutrient[] };
};
type SearchResponse = { results: SearchResult[] };
type InformationResponse = { extendedIngredients: { nameClean?: string; name: string; amount: number; unit: string }[] };

const isFake = () => process.env.FAKE_SPOONACULAR === "1";

class QuotaError extends Error {}

const loadSearchFixture = async () =>
	(await import("./fixtures/complex-search.json", { with: { type: "json" } })).default as SearchResponse;
const loadInformationFixture = async () =>
	(await import("./fixtures/recipe-information.json", { with: { type: "json" } })).default as InformationResponse;

/** Runs the real call; on a quota/payment error, logs a warning and uses the fixture instead. */
async function withQuotaFallback<T>(real: () => Promise<T>, fixture: () => Promise<T>): Promise<T> {
	try {
		return await real();
	} catch (error) {
		if (!(error instanceof QuotaError)) throw error;
		console.warn(`[spoonacular] ${error.message}; serving fixtures instead`);
		return fixture();
	}
}

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
	const key = process.env.SPOONACULAR_API_KEY;
	if (!key) throw new Error("SPOONACULAR_API_KEY is not set");
	const url = new URL(BASE + path);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	// Key in a header so it never appears in URLs or logs.
	const res = await fetch(url, { headers: { "x-api-key": key } });
	if (res.status === 402 || res.status === 429) throw new QuotaError(`quota/payment limit hit (${res.status})`);
	if (!res.ok) throw new Error(`Spoonacular ${path} failed (${res.status})`);
	return (await res.json()) as T;
}

const macro = (nutrients: Nutrient[] | undefined, name: string) => {
	const n = nutrients?.find((x) => x.name === name);
	return n ? Math.round(n.amount) : null;
};

export async function searchRecipes(search: RecipeSearch): Promise<RecipeOption[]> {
	const fromFixture = async () => {
		const all = await loadSearchFixture();
		return { results: all.results.filter((r) => r.readyInMinutes <= search.maxReadyTime) };
	};
	let data: SearchResponse;
	if (isFake()) {
		data = await fromFixture();
	} else {
		const params: Record<string, string> = {
			maxReadyTime: String(search.maxReadyTime),
			number: String(search.number ?? 3),
			addRecipeInformation: "true",
			addRecipeNutrition: "true",
		};
		if (search.query) params.query = search.query;
		if (search.diet) params.diet = search.diet;
		if (search.intolerances?.length) params.intolerances = search.intolerances.join(",");
		if (search.includeIngredients?.length) params.includeIngredients = search.includeIngredients.join(",");
		data = await withQuotaFallback(() => get<SearchResponse>("/recipes/complexSearch", params), fromFixture);
	}
	return data.results.map((r) => ({
		id: r.id,
		title: r.title,
		readyInMinutes: r.readyInMinutes,
		image: r.image ?? null,
		sourceUrl: r.sourceUrl,
		sourceName: r.sourceName ?? null,
		macros: {
			calories: macro(r.nutrition?.nutrients, "Calories"),
			proteinG: macro(r.nutrition?.nutrients, "Protein"),
			carbsG: macro(r.nutrition?.nutrients, "Carbohydrates"),
			fatG: macro(r.nutrition?.nutrients, "Fat"),
		},
	}));
}

export async function getRecipeIngredients(recipeId: number): Promise<Ingredient[]> {
	const data = isFake()
		? await loadInformationFixture()
		: await withQuotaFallback(
				() => get<InformationResponse>(`/recipes/${recipeId}/information`, { includeNutrition: "false" }),
				loadInformationFixture,
			);
	return data.extendedIngredients.map((i) => ({ name: i.nameClean ?? i.name, amount: i.amount, unit: i.unit }));
}
