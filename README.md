## Getting Started

```bash
pnpm i
pnpm dev
```

> Make sure your authenticator allows passkey generation for `localhost`


### KeepassXC desktop
settings -> browser integration -> advanced -> allow using localhost for passkey generation


### Google Password (manager)
connect phone to PC via `adb`
```bash
adb reverse tcp:3000 tcp:3000
```

On a phone open `https://localhost:3000`


## Tech stack

`webauthn/server` used in route handlers to generate options and validate passkeys
`iron-session` used to preserve sensitive data in http-only cookie. To pass user.name during registration process
`JWT` used to preserve authenticated session



Dom exceptions, thrown in response to authenticator response
https://webidl.spec.whatwg.org/#aborterror


Core difference: webAuthnUserID identifies the user; id identifies the passkey/credential.
 	webAuthnUserID (currentOptions.user.id)	id (credential.id)
What it is	Your account handle (userHandle / WebAuthn user.id)	The credential's unique ID (credential ID)
Scope	One per user — with discoverable credentials, every passkey for that user shares it	One per passkey — a user with 3 devices has 3 different credential IDs
Who creates it	You, in generateRegistrationOptions (auto-random here)	The authenticator, at registration
Cardinality in your DB	Same value repeated on every passkey row of that user	Unique value per row
Returned at login?	Only if credential is discoverable (response.userHandle)	Always (response.id)
Cardinality in login response	Identifies the user (may match multiple passkey rows)	Identifies exactly one passkey row

