---
applyTo: '**'
---

When a user asks for a changeset to be generated, follow the following rules:

Create a good changeset file for the changes in the diff. Don't include non-frontfacing changes, as the changeset file will be used for the changelog. Our users don't care about deep logic that they'll not interact with so we only want to generate changelog entries for front-facing/user-facing changes and API changes our users will need to know about.

Make sure that the changeset file stays minimal and short but includes important information that may be important for our users to understand what actually changed.
