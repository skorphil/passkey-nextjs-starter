import {
	type RegistrationResponseJSON,
	type VerifiedRegistrationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { saveUserWithPasskey } from "@/db/queries";
import type { RegistrationSession } from "../initialize/route";

const rpID = process.env.RP_ID || "localhost";

export async function POST(req: Request) {
	const sessionPass = process.env.SESSION_PASSWORD;
	if (!sessionPass)
		return NextResponse.json(
			{ error: "Server misconfigured" },
			{ status: 500 },
		);

	const session = await getIronSession<RegistrationSession>(await cookies(), {
		password: sessionPass,
		cookieName: "registration-session",
	});

	if (!session.challenge || !session.userName)
		return NextResponse.json(
			{ error: "No registration in progress" },
			{ status: 400 },
		);

	const attResp = (await req.json()) as RegistrationResponseJSON;

	let verification: VerifiedRegistrationResponse;
	try {
		verification = await verifyRegistrationResponse({
			response: attResp,
			expectedChallenge: session.challenge,
			expectedOrigin: "https://localhost:3000",
			expectedRPID: rpID,
		});
	} catch (error) {
		console.error(error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 400 });
	}

	if (!verification.verified) {
		return NextResponse.json({ error: "Verification failed" }, { status: 400 });
	}

	const { credential, credentialDeviceType, credentialBackedUp } =
		verification.registrationInfo;

	const userId = crypto.randomUUID();
	const userName = session.userName;

	try {
		await saveUserWithPasskey(userName, userId, {
			id: credential.id,
			publicKey: Buffer.from(credential.publicKey).toString("base64url"),
			counter: credential.counter,
			deviceType: credentialDeviceType,
			backedUp: credentialBackedUp,
			transports: JSON.stringify(
				attResp.response.transports ?? credential.transports ?? [],
			),
		});
	} catch (error) {
		console.error(error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}

	return NextResponse.json(verification);
}
