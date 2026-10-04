// Spoonacular client (server-only). Docs: https://spoonacular.com/food-api/docs
// Terms: only recipe id, title and image URL may be stored. Don't persist anything else.
// FAKE_SPOONACULAR=1 serves the synthetic fixtures in ./fixtures (0 quota points).

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

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
	const key = process.env.SPOONACULAR_API_KEY;
	if (!key) throw new Error("SPOONACULAR_API_KEY is not set");
	const url = new URL(BASE + path);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	// Key in a header so it never appears in URLs or logs.
	const res = await fetch(url, { headers: { "x-api-key": key } });
	if (!res.ok) throw new Error(`Spoonacular ${path} failed (${res.status})`);
	return (await res.json()) as T;
}

const macro = (nutrients: Nutrient[] | undefined, name: string) => {
	const n = nutrients?.find((x) => x.name === name);
	return n ? Math.round(n.amount) : null;
};

export async function searchRecipes(search: RecipeSearch): Promise<RecipeOption[]> {
	let data: SearchResponse;
	if (isFake()) {
		data = (await import("./fixtures/complex-search.json", { with: { type: "json" } })).default as SearchResponse;
		data = { results: data.results.filter((r) => r.readyInMinutes <= search.maxReadyTime) };
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
		data = await get<SearchResponse>("/recipes/complexSearch", params);
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
		? ((await import("./fixtures/recipe-information.json", { with: { type: "json" } })).default as InformationResponse)
		: await get<InformationResponse>(`/recipes/${recipeId}/information`, { includeNutrition: "false" });
	return data.extendedIngredients.map((i) => ({ name: i.nameClean ?? i.name, amount: i.amount, unit: i.unit }));
}
