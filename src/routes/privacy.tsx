import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
});

const h2 = "mt-12 mb-4 text-xl font-semibold text-stone-900 sm:text-2xl";
const ul =
	"list-disc space-y-2 pl-6 marker:text-amber-500 [&_strong]:font-semibold [&_strong]:text-stone-900";
const link =
	"font-medium text-orange-700 underline decoration-orange-300 underline-offset-2 break-words hover:decoration-orange-700";

function PrivacyPage() {
	return (
		<div className="min-h-screen bg-amber-50/60 text-stone-700">
			<article className="mx-auto max-w-[65ch] px-4 py-12 text-base leading-relaxed sm:py-20 sm:text-lg [&_p]:mb-4">
				<header className="mb-10 border-b border-amber-200 pb-8">
					<h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
						Privacy Policy — Watts for Dinner
					</h1>
					<p className="mt-3 text-sm text-stone-500 sm:text-base">
						<strong className="font-semibold text-stone-600">
							Effective date:
						</strong>{" "}
						October 4, 2026
					</p>
				</header>

				<p>
					Watts for Dinner ("Watts", "we", "us") is an open source personal chef
					and coach app built by Bianca Silva and Michael. Watts suggests
					home-cooked meals based on how much energy you have, your food
					preferences and your WHOOP recovery data. This policy explains what we
					collect, why, and what control you have.
				</p>
				<p>
					Watts started as a hackathon project. It's built for a small number of
					users, and the source code is public at{" "}
					<a className={link} href="https://github.com/TokiLoshi/watts-for-dinner">
						https://github.com/TokiLoshi/watts-for-dinner
					</a>
					, so you can see exactly what it does with your data.
				</p>

				<h2 className={h2}>What we collect</h2>
				<ul className={ul}>
					<li>
						<strong>Account information:</strong> your name and email address
						from Google sign-in.
					</li>
					<li>
						<strong>WHOOP data:</strong> only after you connect your WHOOP
						account and approve access. We request read-only access to your
						profile, recovery, strain (cycles), sleep and workouts.
					</li>
					<li>
						<strong>Your food profile:</strong> dietary preferences, your goal,
						favourite meals and what you ate recently, as you enter them.
					</li>
					<li>
						<strong>Meal history:</strong> meals Watts suggested, and whether
						you rated them a "keeper".
					</li>
					<li>
						<strong>Chat messages and fridge photos:</strong> what you send to
						Watts in the chat.
					</li>
				</ul>

				<h2 className={h2}>How we use it</h2>
				<p>
					We use your data only to run Watts for you. That means suggesting meals
					that fit your energy, recovery, preferences and goals, building
					shopping lists, and avoiding repeat meals.
				</p>
				<p>
					We don't sell your data, we don't use it for advertising, and we don't
					share it with anyone except the services below that make the app work.
				</p>

				<h2 className={h2}>Services that process your data</h2>
				<ul className={ul}>
					<li>
						<strong>Neon</strong> stores your account, profile, meal history and
						ratings in our database. Neon also routes requests to Claude through
						its AI Gateway.
					</li>
					<li>
						<strong>Anthropic (Claude)</strong> processes your chat messages and
						fridge photos to generate replies. Fridge photos are analysed to
						identify ingredients and are not stored by Watts.
					</li>
					<li>
						<strong>Spoonacular</strong> receives recipe and ingredient searches.
						We don't send it your name, email or WHOOP data.
					</li>
					<li>
						<strong>Exa</strong> receives recipe search queries. We don't send it
						your name, email or WHOOP data.
					</li>
					<li>
						<strong>Fly.io</strong> hosts the app.
					</li>
					<li>
						<strong>Google</strong> handles sign-in.
					</li>
					<li>
						<strong>WHOOP</strong> provides your fitness data when you connect
						your account.
					</li>
				</ul>
				<p className="mt-4">
					Each service handles data under its own privacy policy.
				</p>

				<h2 className={h2}>WHOOP data</h2>
				<p>
					We use WHOOP data only to tailor meal suggestions to your recovery and
					activity. We never write data back to WHOOP.
				</p>
				<p>
					You can disconnect WHOOP at any time from your WHOOP account settings
					or by asking us. When you do, we stop fetching your data and delete the
					WHOOP tokens and any WHOOP data we've stored.
				</p>

				<h2 className={h2}>Storage and security</h2>
				<p>
					Your data is stored in a Postgres database hosted by Neon. API keys and
					access tokens stay on our server and are never sent to your browser.
					Connections use HTTPS.
				</p>

				<h2 className={h2}>Keeping and deleting your data</h2>
				<p>
					We keep your data while your account exists. To delete your account
					and all associated data, email us at the address below and we'll do it
					within 30 days.
				</p>

				<h2 className={h2}>Children</h2>
				<p>
					Watts is not intended for anyone under 13, and we don't knowingly
					collect data from them.
				</p>

				<h2 className={h2}>Changes</h2>
				<p>
					If we change this policy, we'll update the date at the top of this
					page.
				</p>

				<h2 className={h2}>Contact</h2>
				<p>
					Questions or deletion requests:{" "}
					<a className={link} href="mailto:silvabee@gmail.com">
						silvabee@gmail.com
					</a>
				</p>
			</article>
		</div>
	);
}
