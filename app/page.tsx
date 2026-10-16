import { startRegistration } from "@simplewebauthn/browser";

export default function Home() {
	return (
		<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="gap-3 flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
				<h2 className="text-2xl font-bold">
					NextJs webauthn integration example
				</h2>
			</main>
		</div>
	);
}
