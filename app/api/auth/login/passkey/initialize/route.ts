import {
	generateAuthenticationOptions,
	type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const rpID = process.env.RP_ID || "localhost";

export async function GET() {
	const sessionPass = process.env.SESSION_PASSWORD;
	if (!sessionPass)
		return NextResponse.json(
			{ error: "Server misconfigured" },
			{ status: 500 },
		);

	const options: PublicKeyCredentialRequestOptionsJSON =
		await generateAuthenticationOptions({
			rpID,
			userVerification: "required",
			// No allowCredentials: discoverable credentials are discovered
			// automatically, and the authenticator returns the userHandle.
		});

	const session = await getIronSession<LoginSession>(await cookies(), {
		password: sessionPass,
		cookieName: "login-session",
	});
	session.challenge = options.challenge;
	await session.save();

	return NextResponse.json(options);
}

export type LoginSession = {
	challenge: string;
	webAuthnUserId?: string;
};
