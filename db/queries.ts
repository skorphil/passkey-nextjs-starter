import { db } from "./index";
import { passkeys, users } from "./schema";

type DbClient =
	| typeof db
	| Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function saveUserToDb(
	userName: string,
	userId: string,
	client: DbClient = db,
) {
	await client.insert(users).values({
		userId,
		userName,
		createdAt: new Date(),
	});
}

type NewPasskey = {
	id: string;
	userId: string;
	publicKey: string;
	counter: number;
	deviceType: string;
	backedUp: boolean;
	transports?: string | null;
};

export async function savePasskeyToDb(
	passkey: NewPasskey,
	client: DbClient = db,
) {
	await client.insert(passkeys).values({
		...passkey,
		createdAt: new Date(),
	});
}

export async function saveUserWithPasskey(
	userName: string,
	userId: string,
	passkey: Omit<NewPasskey, "userId">,
) {
	await db.transaction(async (tx) => {
		await saveUserToDb(userName, userId, tx);
		await savePasskeyToDb({ ...passkey, userId }, tx);
	});
}
