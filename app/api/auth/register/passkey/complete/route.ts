import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const sessionPass = process.env.SESSION_PASSWORD;
	if (!sessionPass)
		return NextResponse.json(
			{ error: "Server misconfigured" },
			{ status: 500 },
		);

	// Create user entry

	// Create passkey entry

	return options;
}
