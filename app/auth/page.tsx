"use client";

import {
	type RegistrationResponseJSON,
	startRegistration,
} from "@simplewebauthn/browser";
import { useState } from "react";

export default function Auth() {
	const [popupText, setPopupText] = useState<string | undefined>(undefined);

	const handleRegister = async (userName: string) => {
		const res = await fetch("/api/auth/register/passkey/initialize", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userName }),
		});

		const optionsJSON = await res.json();

		let attResp: RegistrationResponseJSON;
		try {
			// Pass the options to the authenticator and wait for a response
			attResp = await startRegistration({ optionsJSON });
		} catch (error) {
			// Some basic error handling
			if (error.name === "InvalidStateError") {
				setPopupText(
					"Error: Authenticator was probably already registered by user",
				);
				setTimeout(() => setPopupText(undefined), 1000);
			} else {
				setPopupText(JSON.stringify(error));
				setTimeout(() => setPopupText(undefined), 1000);
			}
			throw error;
		}

		const verificationResp = await fetch(
			"/api/auth/register/passkey/initialize/complete",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(attResp),
			},
		);

		// Wait for the results of verification
		const verificationJSON = await verificationResp.json();

		// Show UI appropriate for the `verified` status
		if (verificationJSON && verificationJSON.verified) {
			setPopupText("Success!");
			setTimeout(() => setPopupText(undefined), 1000);
		} else {
			setPopupText(
				`Oh no, something went wrong! Response: ${JSON.stringify(
					verificationJSON,
				)}`,
			);
			setTimeout(() => setPopupText(undefined), 1000);
		}
	};

	return (
		<form>
			<label className="flex flex-col gap-0">
				Name
				<input
					type="text"
					name="userName"
					className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
				/>
			</label>
			<button
				onClick={(e) => handleRegister(e.currentTarget.form.userName.value)}
				className="mt-3 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
				type="button"
			>
				Register
			</button>
			<button
				className="mt-3 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
				type="button"
			>
				Login
			</button>
			{popupText && <div>{popupText}</div>}
		</form>
	);
}
