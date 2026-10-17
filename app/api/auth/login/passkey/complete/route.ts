import {
	type AuthenticationResponseJSON,
	verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
	getPasskeyByWebAuthnUserId,
	updatePasskeyCounter,
} from "@/db/queries";
import type { LoginSession } from "../initialize/route";

const rpID = process.env.RP_ID || "localhost";

export async function POST(req: Request) {
	const sessionPass = process.env.SESSION_PASSWORD;
	if (!sessionPass)
		return NextResponse.json(
			{ error: "Server misconfigured" },
			{ status: 500 },
		);

	const session = await getIronSession<LoginSession>(await cookies(), {
		password: sessionPass,
		cookieName: "login-session",
	});

	if (!session.challenge)
		return NextResponse.json(
			{ error: "No login in progress" },
			{ status: 400 },
		);

	const response = (await req.json()) as AuthenticationResponseJSON;

	const userHandle = response.response.userHandle;
	if (!userHandle)
		return NextResponse.json(
			{ error: "Missing userHandle (credential not discoverable)" },
			{ status: 400 },
		);

	const passkey = await getPasskeyByWebAuthnUserId(userHandle);
	if (!passkey)
		return NextResponse.json(
			{ error: "Unknown credential" },
			{ status: 400 },
		);

	try {
		const verification = await verifyAuthenticationResponse({
			response,
			expectedChallenge: session.challenge,
			expectedOrigin: "https://localhost:3000",
			expectedRPID: rpID,
			requireUserVerification: true,
			credential: {
				id: passkey.id,
				publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64url")),
				counter: passkey.counter,
				transports: passkey.transports
					? (JSON.parse(passkey.transports) as string[])
					: undefined,
			},
		});

		if (!verification.verified) {
			return NextResponse.json(
				{ error: "Verification failed" },
				{ status: 400 },
			);
		}

		await updatePasskeyCounter(
			passkey.id,
			verification.authenticationInfo.newCounter,
		);

		session.webAuthnUserId = passkey.webAuthnUserId;
		await session.save();

		return NextResponse.json({ verified: true, userId: passkey.userId });
	} catch (error) {
		console.error(error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 400 });
	}
}
