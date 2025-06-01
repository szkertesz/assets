# Global Typography Refactoring & Language-Aware Font Strategy

## Context & Current Challenges

- Element-Level Font Declarations: font-family rules are applied directly to individual textual elements. This leads to redundancy and makes it difficult to switch fonts based on language context.

- Hardcoded Element-Based Styling: Many typographic styles are applied directly to HTML tags (e.g., h1, p) and often use deep CSS nesting. This tight coupling reduces flexibility and makes global style updates complex.

- No Built-in Multilingual Support: The current setup doesn't support switching fonts for different languages, making multilingual or mixed-language content hard to implement.

These practices together result in a rigid system where even simple style changes require broad and repetitive updates throughout the codebase.

## Proposed Approach

To improve maintainability, scalability, and support for multiple languages, we propose the following:

### 1. Language-Specific Font Variables for Different Text Roles

Use the lang attribute to define semantic font family variables (e.g., --font-family-base, --font-family-bold, --font-family-heading). This allows language-specific font control across different weights and roles.

```css
[lang="en"] {
  --font-family-base: 'Inter', sans-serif;
  --font-family-bold: 'Inter Bold', sans-serif;
  --font-family-heading: 'Inter SemiBold', sans-serif;
}

[lang="jp"] {
  --font-family-base: 'Noto Sans JP', sans-serif;
  --font-family-bold: 'Noto Sans JP Bold', sans-serif;
  --font-family-heading: 'Noto Sans JP Medium', sans-serif;
}
```

### 2. Class-Based Typographic System

- Define reusable utility classes (e.g., .text-heading-lg, .text-body-sm) based on design tokens.

- Avoid using element selectors for typography to ensure portability and flexibility.

### 3. Use CSS Variables for All Typography Tokens

- Managing font size, weight, and line-height with CSS variables allows updates by changing values in one centralized place

- Responsive typography should be implemented via media queries that update these values.

## Design Team Involvement

- System Alignment: System Alignment: The design team defines typographic styles in Figma first, and the development team builds the class-based CSS system to precisely match these design specifications.

- Consistent Use: Future designs should consistently reuse the set of typographic roles -- e.g. by leveraging Figma components -- avoiding the introduction of custom one-off styles.

- Implementation Support: During the transition, devs may uncover inconsistencies. Collaboration is needed to audit and standardize these cases.

[Benefits

Full Multi-Language Support: Flexible font-family control based on both language and text role (weight/style).

Better Maintainability: Centralized styles and semantic classes reduce duplication and inconsistency.

Design-Dev Alignment: Shared system reduces rework and communication gaps.

Responsive & Scalable: Custom properties + media queries ensure typography adapts cleanly across breakpoints.]



# Developer Implementation Guide

Step-by-Step

1. Define Font Variables per Language and Text Role

[lang="en"] {
  --font-family-base: 'Inter', sans-serif;
  --font-family-bold: 'Inter Bold', sans-serif;
  --font-family-heading: 'Inter SemiBold', sans-serif;
}

[lang="jp"] {
  --font-family-base: 'Noto Sans JP', sans-serif;
  --font-family-bold: 'Noto Sans JP Bold', sans-serif;
  --font-family-heading: 'Noto Sans JP Medium', sans-serif;
}

2. Build Reusable Typography Classes

.text-body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
}

.text-bold {
  font-family: var(--font-family-bold);
  font-weight: bold;
}

.text-heading-lg {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-heading-lg);
}

3. Centralize Typography Tokens

:root {
  --font-size-body: 14px;
  --font-size-heading-lg: 32px;
  --line-height-body: 1.6;
}

@media (min-width: 768px) {
  :root {
    --font-size-body: 16px;
    --font-size-heading-lg: 36px;
  }
}

4. Refactor Components

Replace inline and tag-based typography with the new utility classes.

Apply lang attributes at logical container levels to scope font switching.

5. Handle Exceptions

Flag legacy or inconsistent styles.

Collaborate with the design team to resolve discrepancies.

Best Practices

Avoid hardcoding font-family directly on elements.

Use classes to apply semantic meaning, not HTML element names.

Keep lang attribute usage consistent and scoped.

Document all tokens and utility classes in a shared reference.

Next Steps

Audit existing typography in the codebase.

Finalize variable/token naming with design.

Begin component-level refactor with shared components.

Integrate into CI/code review linting rules.

Track migration progress centrally.
