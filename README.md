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

