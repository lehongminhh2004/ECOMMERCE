# Project Rules for Agents

Before changing this repository, read and follow the rule files in `rules/`.

## Required Reading

- `rules/architecture.md`: application boundaries and ownership.
- `rules/ports.md`: local/cloud URL and port conventions.
- `rules/deployment-runtime.md`: Vercel, Render, runtime, worker and env rules.
- `rules/styling.md`: storefront and CMS styling rules.

## Non-Negotiable Boundaries

- Keep `apps/server` as the Vendure commerce backend.
- Keep `apps/cms` as the Payload content system.
- Keep `apps/storefront` as the customer-facing Next.js app.
- Do not add direct database access to `apps/storefront`.
- Do not move commerce behavior into Payload CMS.
- Do not deploy Vendure as a Vercel serverless app.

## Validation Expectations

- For Vendure changes, run `npm run build -w server`.
- For storefront changes, run `npm run build -w storefront`.
- For CMS changes, run `npm run build -w cms`.
- For deployment changes, check the relevant provider URL and environment variable shape before assuming code is broken.
