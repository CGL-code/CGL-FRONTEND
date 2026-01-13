export const semantics = [
  {
    semanticId: "SEM01",
    title: "Concept Introduction",
    intent: "Introduce a new concept clearly before deeper details begin.",
    contentVersion: "1.0.0",
    changeLog: [
      "2025-12-28: Initial version created (XS/S/M skeleton with guidance).",
    ],
    capsules: {
      XS: "Introduces a new idea in simple terms before details.",
      S:
        "Concept Introduction is where you open the door to a new idea. It tells the reader what the concept is, why it matters, and what they will gain—without going deep yet. After reading this, a reader should feel: “I know what this is, why I should care, and what comes next.”",
      M: `## What this semantic must achieve
1. Name the concept (clear label)
2. Give a plain definition (no heavy jargon)
3. Explain why it matters (benefit/impact)
4. Set expectation (what comes next)

## Suggested writing pattern (reliable)
1) Definition (2–4 lines)
2) Context (Why now?) (3–5 lines)
3) Value (What does the reader gain?) (3–5 lines)
4) Roadmap (What comes next?) (2–4 lines)

## Do’s and Don’ts
**Do**
- Use simple words first, technical words later
- Use one small example
- Keep it short and confident

**Don’t**
- Dump full theory here
- Add long lists of subtopics
- Use multiple new terms without explaining them
`,
      L: "Deep reference for SEM01 can be added later (multi-section content).",
    },
    notesForAuthors:
      "Keep this lightweight. Your goal is orientation, not mastery.",
  },
  {
    semanticId: "SEM02",
    title: "Concept Expansion",
    intent:
      "Deepen understanding by explaining structure, relationships, and practical application.",
    contentVersion: "1.0.0",
    changeLog: [
      "2025-12-28: Initial version created (XS/S/M skeleton with guidance).",
    ],
    capsules: {
      XS: "Expands a known concept by showing how it works and where it applies.",
      S:
        "Concept Expansion opens up a concept the reader already recognizes—showing its internal structure, how parts relate, and how it behaves in real use. After this, the reader should feel: “I can work with this now.”",
      M: `## What this semantic does
1. Breaks the concept into components
2. Explains relationships and flow
3. Shows typical usage patterns
4. Clarifies boundaries (what it is / isn’t)

## Reliable expansion pattern
1) Recall (2–3 lines) — restate briefly
2) Decomposition — key parts/dimensions
3) Interaction — how parts influence each other
4) Application — where/how used
5) Transition — point to next semantic

## Do’s and Don’ts
**Do**
- Use structured lists and small diagrams
- Reuse terms already introduced
- Include one realistic scenario

**Don’t**
- Re-introduce from scratch
- Jump to edge cases too early
- Mix summary with expansion
`,
      L: "Deep reference for SEM02 can be added later (trade-offs, variations, cross-links).",
    },
    notesForAuthors:
      "Avoid re-defining from scratch. Expand what’s already introduced.",
  },
];
