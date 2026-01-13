# PACKAGE 4 — Robo Entry Point (Controlled Fill Protocol)

This is the **operational protocol** for filling the medicine cabinet safely—whether the “Digital Robo” is a script,
a developer, or an AI assistant.

## 1) Roles & Boundaries
### Human-only territory (never auto-modify)
- Semantic IDs (`SEMxx`) once published
- DSCode IDs (`DSxxx`) once used in saved records
- The meaning of BT/CT structural types (Book/Chapter/etc.)

### Robo-allowed territory (safe to refill)
- Capsule text content:
  - XS (one-liner)
  - S (1–2 paragraphs)
  - M (1–2 pages)
  - L (deep reference)
- Examples and author notes
- New Semantics (new IDs) and new DS codes *only* when explicitly approved by the project owner

## 2) Storage Locations (where Robo can write)
**Config (identity):**
- `src/semanticCabinet/config/semantics.js` → IDs + titles + capsule fields
- `src/semanticCabinet/config/dsCodes.js` → DSCode labels
- `src/semanticCabinet/config/mappings.js` → Semantic → DSCode relationships

**Rule:** Robo may update *text fields* inside these configs, but must not rename existing IDs.

## 3) Versioning & Rollback (must-have)
Whenever Robo changes content:
- Increment `contentVersion` inside the semantic object (e.g., `1.0.0` → `1.0.1`)
- Add a `changeLog` line (date + summary)
- Keep the previous text (either in git history or in a `previousCapsules` field)

**Minimum rollback method (recommended):** Use Git commits:
- `feat(semantic): update SEM02 M capsule`
- If something feels wrong, revert the commit.

## 4) Validation Rules (guardrails)
- XS must be <= 200 characters (guideline)
- S should be <= ~900 characters (guideline)
- M may be long, but must be structured with headings
- DSCode mapping must reference valid DS codes only
- The UI stores **DSCode only** as the persisted value (semantic is guidance)

## 5) Fill Workflow (the safe sequence)
1) Pick a semantic (e.g., SEM02)
2) Fill XS → then S → then M → then L (if needed)
3) Update DSCode mapping (only if needed)
4) Human review: approve or request edits
5) Publish (merge to main branch)

## 6) “No Prescription” Rule (user dignity)
- Content must be accessible at XS/S without requiring M/L
- M/L are optional “dive deeper” layers
- Never force navigation through deep content

## 7) Forbidden Actions
Robo must never:
- Rename SEMxx or DSxxx IDs already in use
- Change meaning of an existing DS code drastically without approval
- Change BT/CT meaning or repurpose those fields
- Store the long content inside dropdown items (UI overload)

---
**Outcome:** The cabinet stays stable, and the Robo can refill safely at any time.
