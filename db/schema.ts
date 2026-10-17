import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	userId: text("user_id").primaryKey(),
	userName: text("user_name").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const passkeys = sqliteTable("passkeys", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.userId),
	webAuthnUserId: text("web_authn_user_id").notNull(),
	publicKey: text("public_key").notNull(),
	counter: integer("counter").notNull().default(0),
	deviceType: text("device_type").notNull(),
	backedUp: integer("backed_up", { mode: "boolean" }).notNull(),
	transports: text("transports"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
