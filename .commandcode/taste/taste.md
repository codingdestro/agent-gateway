# Taste

## Architecture & Code Organization
- Prefers feature modules organized as separate files with a clear layered split: `validation.ts` (schemas/types), `repository.ts` (data access), `service.ts` (business logic), and `controller.ts` (HTTP handlers) as classes. Confidence: 0.7
- New database tables are added via timestamped migration files (node-pg-migrate style) with `up`/`down` exports. Confidence: 0.6
- Wants cross-cutting request concerns (e.g. auth/session resolution) handled in Express middleware in `src/middlewares/` that attach data to the request (e.g. `req.userId`), with the controller just consuming it rather than resolving the session itself. Confidence: 0.6
- Augments Express request types globally via a `src/types/*.d.ts` `declare global` block instead of inline casts. Confidence: 0.55

## Workflow & Testing
- Expects HTTP endpoints to be verified end-to-end by actually exercising them (e.g. `curl`) against the running dev server, not just typechecking. Confidence: 0.5
