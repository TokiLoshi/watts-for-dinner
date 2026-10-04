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
	/** null for fixture recipes: there's no real source to link. */
	sourceUrl: string | null;
	sourceName: string | null;
	macros: { calories: number | null; proteinG: number | null; carbsG: number | null; fatG: number | null };
	/** Only when includeIngredients was given: which of them the recipe uses, and what else it needs. */
	usedIngredients?: string[];
	missingIngredients?: string[];
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
	usedIngredients?: { name: string }[];
	missedIngredients?: { name: string }[];
};
type SearchResponse = { results: SearchResult[] };
type InformationResponse = {
	extendedIngredients: { nameClean?: string; name: string; amount: number; unit: string }[];
	instructions?: string | null;
	analyzedInstructions?: { steps: { number: number; step: string }[] }[];
};

const isFake = () => process.env.FAKE_SPOONACULAR === "1";

class QuotaError extends Error {}

/** Fixture recipes use negative ids; real Spoonacular ids are always positive. */
export const isFixtureRecipeId = (id: number) => id < 0;

const loadSearchFixture = async () =>
	(await import("./fixtures/complex-search.json", { with: { type: "json" } })).default as SearchResponse;
const loadInformationFixture = async (recipeId: number) => {
	const fixture =
		recipeId === -2
			? await import("./fixtures/recipe-information-tacos.json", { with: { type: "json" } })
			: recipeId === -3
				? await import("./fixtures/recipe-information-traybake.json", { with: { type: "json" } })
				: await import("./fixtures/recipe-information.json", { with: { type: "json" } });
	return fixture.default as InformationResponse;
};

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

const norm = (s: string) => s.toLowerCase().trim().replace(/es$|s$/, "");
const looselyMatches = (a: string, b: string) => {
	const x = norm(a);
	const y = norm(b);
	return x === y || x.includes(y) || y.includes(x);
};

const macro = (nutrients: Nutrient[] | undefined, name: string) => {
	const n = nutrients?.find((x) => x.name === name);
	return n ? Math.round(n.amount) : null;
};

export async function searchRecipes(search: RecipeSearch): Promise<RecipeOption[]> {
	const have = search.includeIngredients ?? [];
	const fromFixture = async () => {
		const all = await loadSearchFixture();
		const results = all.results.filter((r) => r.readyInMinutes <= search.maxReadyTime);
		if (!have.length) return { results };
		// Mirror fillIngredients: split each fixture recipe's ingredients into used / missing.
		const withFill = await Promise.all(
			results.map(async (r) => {
				const ingredients = (await loadInformationFixture(r.id)).extendedIngredients.map((i) => ({ name: i.nameClean ?? i.name }));
				const used = ingredients.filter((i) => have.some((h) => looselyMatches(i.name, h)));
				return { ...r, usedIngredients: used, missedIngredients: ingredients.filter((i) => !used.includes(i)) };
			}),
		);
		return { results: withFill.sort((a, b) => a.missedIngredients.length - b.missedIngredients.length) };
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
		if (have.length) {
			// Fridge mode: rank by fewest missing ingredients and report used/missing per recipe.
			params.includeIngredients = have.join(",");
			params.fillIngredients = "true";
			params.sort = "min-missing-ingredients";
		}
		data = await withQuotaFallback(() => get<SearchResponse>("/recipes/complexSearch", params), fromFixture);
	}
	return data.results.map((r) => {
		const fixture = isFixtureRecipeId(r.id);
		return {
			id: r.id,
			title: r.title,
			readyInMinutes: r.readyInMinutes,
			// Fixture images and sources are placeholders: don't show or link them.
			image: fixture ? null : (r.image ?? null),
			sourceUrl: fixture ? null : r.sourceUrl,
			sourceName: fixture ? null : (r.sourceName ?? null),
			macros: {
				calories: macro(r.nutrition?.nutrients, "Calories"),
				proteinG: macro(r.nutrition?.nutrients, "Protein"),
				carbsG: macro(r.nutrition?.nutrients, "Carbohydrates"),
				fatG: macro(r.nutrition?.nutrients, "Fat"),
			},
			...(have.length && {
				usedIngredients: (r.usedIngredients ?? []).map((i) => i.name),
				missingIngredients: (r.missedIngredients ?? []).map((i) => i.name),
			}),
		};
	});
}

// Ingredients and steps come from one information call (1 point). Not stored: Spoonacular's terms.
async function loadInformation(recipeId: number): Promise<InformationResponse> {
	// Fixture recipes (e.g. served during a quota fallback) never hit the real API.
	return isFake() || isFixtureRecipeId(recipeId)
		? await loadInformationFixture(recipeId)
		: await withQuotaFallback(
				() => get<InformationResponse>(`/recipes/${recipeId}/information`, { includeNutrition: "false" }),
				() => loadInformationFixture(recipeId),
			);
}

const toIngredients = (data: InformationResponse): Ingredient[] =>
	data.extendedIngredients.map((i) => ({ name: i.nameClean ?? i.name, amount: i.amount, unit: i.unit }));

/** Numbered steps: analyzedInstructions if present, else the plain instructions split into sentences. */
function toSteps(data: InformationResponse): string[] {
	const analyzed = (data.analyzedInstructions ?? []).flatMap((block) => block.steps.map((s) => s.step.trim()));
	if (analyzed.length) return analyzed.filter(Boolean);
	const plain = (data.instructions ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
	return plain ? plain.split(/(?<=[.!?])\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean) : [];
}

export async function getRecipeIngredients(recipeId: number): Promise<Ingredient[]> {
	return toIngredients(await loadInformation(recipeId));
}

/** Ingredients and cooking steps for one recipe, from a single API call. */
export async function getRecipeDetails(recipeId: number): Promise<{ ingredients: Ingredient[]; steps: string[] }> {
	const data = await loadInformation(recipeId);
	return { ingredients: toIngredients(data), steps: toSteps(data) };
}
