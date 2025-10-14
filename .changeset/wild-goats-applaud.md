---
"@tiptap/html": patch
---

Fix CVE-2025-61927 by bumping happy-dom to 20.0.0

Bumps the transitive/dev dependency happy-dom from ^18.0.1 → ^20.0.0 in @tiptap/html to address CVE-2025-61927. This is a dependency/security-only change and does not modify any public APIs.

Why:
- happy-dom released a security fix for CVE-2025-61927; updating prevents the vulnerability being pulled into consumers that depend on @tiptap/html.
