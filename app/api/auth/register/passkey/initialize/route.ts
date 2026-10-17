import {
	generateRegistrationOptions,
	type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const rpName = "Authn Nextjs";
const rpID = process.env.RP_ID || "localhost";

export async function POST(req: Request) {
	const sessionPass = process.env.SESSION_PASSWORD;
	if (!sessionPass)
		return NextResponse.json(
			{ error: "Server misconfigured" },
			{ status: 500 },
		);

	const { userName } = (await req.json()) as { userName: string };

	const options: PublicKeyCredentialCreationOptionsJSON =
		await generateRegistrationOptions({
			rpName,
			rpID,
			userName,
			// Don't prompt users for additional information about the authenticator
			// (Recommended for smoother UX)
			attestationType: "none",
			// Make credentials discoverable so usernameless login can find them
			authenticatorSelection: {
				residentKey: "required",
				requireResidentKey: true,
				userVerification: "required",
			},
			// },
		});

	const session = await getIronSession<RegistrationSession>(await cookies(), {
		password: sessionPass,
		cookieName: "registration-session",
	});
	session.userName = userName;
	session.challenge = options.challenge;
	session.webAuthnUserId = options.user.id;
	await session.save();

	return NextResponse.json(options);
}

export type RegistrationSession = {
	userName: string;
	challenge: string;
	rpID: string;
	webAuthnUserId: string;
};
