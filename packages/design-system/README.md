# Ross Tax Pro Design System

Enterprise CSS and Tailwind design package for WORKSPACEIRS.

## Install

```bash
pnpm add @ross-tax-pro/design-system --workspace
```

## CSS usage

```ts
import '@ross-tax-pro/design-system/styles';
```

```html
<section class="ross-hero">
  <div class="ross-container">
    <span class="ross-kicker">Ross Tax Pro Software Co.</span>
    <h1 class="ross-title">Smarter Software. Stronger Results.</h1>
    <p class="ross-subtitle">Secure tax operations, documented workflows, and clearer financial outcomes.</p>
    <a class="ross-btn ross-btn--gold" href="/intake">Start Secure Intake</a>
  </div>
</section>
```

## Tailwind usage

```js
const rossPreset = require('@ross-tax-pro/design-system/tailwind');
module.exports = {
  presets: [rossPreset],
  content: ['./src/**/*.{ts,tsx,html}']
};
```

## Package contents

- `brand/brand.json` — canonical organization, color, slogan, and copyright registry.
- `styles/tokens.css` — primitive and semantic tokens with dark-mode mappings.
- `styles/base.css` — normalization, typography, layout, accessibility, and utility foundations.
- `styles/components.css` — buttons, cards, badges, alerts, forms, hero sections, statistics, grids, and tables.
- `tailwind.preset.cjs` — Ross palette, typography, shadows, and dark-mode settings.

## Governance

1. Use semantic variables instead of hard-coded colors in application code.
2. Maintain WCAG 2.2 AA contrast and keyboard access.
3. Do not imply IRS endorsement or guaranteed tax outcomes.
4. Keep taxpayer, ERO, transcript, and administration routes out of public search indexes.
5. Treat AI-generated titles, CTAs, captions, and compliance language as drafts requiring human review.

© 2026 Ross Tax Pro Software Co. All rights reserved.
