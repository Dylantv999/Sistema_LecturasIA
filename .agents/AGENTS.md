# Sistema_LecturasIA - Workspace Rules

## 1. Frontend Tooling & Shadcn Constraints
- **Tailwind Config (ES Modules)**: The frontend (`LecturaIA.Frontend`) uses ES Modules (`"type": "module"`). The file `tailwind.config.js` MUST use `import` syntax exclusively. Do NOT use `require()`.
- **Tailwind v3 Compatibility**: Shadcn occasionally injects classes like `outline-ring/50` in `style.css`. This causes critical build failures in Tailwind v3. Do NOT use opacity modifiers on variables in `@apply` directives. If you use Shadcn CLI, always verify `style.css` and `tailwind.config.js` to ensure the project continues to build successfully.

## 2. UI/UX Design System (The Official Style)
The application is a modern, gamified educational platform for children (6-12 years). It must look like a premium educational app (e.g., Duolingo, Kahoot) and NEVER like a corporate dashboard or ERP.

### Colors (Material Design 3)
- **Primary**: `#1976D2` (Navigation, main buttons, primary actions)
- **Secondary**: `#FB8C00` (Featured buttons, CTA, rewards)
- **Tertiary**: `#43A047` (Progress, success, achievements)
- **Neutral**: `#74777E` (Text, icons, dividers, disabled states)
*Strict Rule*: Do not use external colors that break this palette.

### Typography
- **Titles**: `Quicksand` or `Nunito`.
- **Body Content**: `Poppins`, `Inter`, or `Roboto Rounded`.
- **Sizing**: Minimum 18px (Ideal 20-22px) with a 1.8 line height. Absolute priority on legibility for kids.

### Component Styling
- **Buttons**: Very large, heavily rounded borders (`rounded-[24px]`), subtle gradients, modern drop shadows, hover elevation/scaling (1.03-1.05), and Ripple effects.
- **Cards**: Spacious padding, 24px borders, subtle glassmorphism, soft shadows, hover elevation.
- **Inputs & Forms**: Rounded icons, animations on focus, friendly placeholders. NO generic forms. Use floating labels or thick, colorful borders on focus (`focus-visible:ring-4 focus-visible:ring-sky-300` or primary color).

### Gamification & Animations
- **Micro-interactions**: Everything must feel alive. Buttons must scale/ripple on hover.
- **Animations**: Use `framer-motion` (installed as `motion`) and `React Bits` components (e.g., `FadeContent`, `SplitText`, `ShinyText`) for entering cards, text reveals, and transitions.
- **Dashboard**: Should feel like a videogame main menu. Integrate XP, coins, streaks, stars, and avatars.
- **Reading Screen**: Immersive, distraction-free. Big text, large line-spacing, short paragraphs, dark mode toggle.
