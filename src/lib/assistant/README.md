# Assistant — Private Knowledge Layer

Server-only. Nothing in this folder is imported by client code or rendered as a UI page.

## Files
- `identity.server.ts` — protected identity knowledge (assistant identity, creator company, owner/founder, response policy) and the `composeIdentitySystemPrompt()` / `getIdentitySystemMessage()` composers.

## How the assistant uses it
Every model call made by the Main AI Voice / Command Assistant server function must prepend `getIdentitySystemMessage()` to its `messages` array, BEFORE the conversation history and user turn:

```ts
import { getIdentitySystemMessage } from "@/lib/assistant/identity.server";

const messages = [
  getIdentitySystemMessage(),                 // private identity block
  { role: "system", content: capabilitiesPrompt }, // auto-built from registries
  ...history,
  { role: "user", content: userInput },
];
```

## Editing rules
- Only edit inside `identity.server.ts`. Do not create a UI editor for these fields.
- When the owner sends approved company/founder copy, paste it into `companyProfile.approvedNotes` and/or `ownerProfile.approvedNotes` — keep it prose, not marketing HTML.
- Never expose the raw object through a server function response. Only `composeIdentitySystemPrompt()` / `getIdentitySystemMessage()` may leave this module.

## When Lovable Cloud is enabled
This module remains the code-side default. If we later add an `assistant.identity` table for admin editing, the loader will merge DB rows over these defaults — but the same composer stays the sole output path.
