# Color and Typography Guide

## Overview

The MENDguild visual identity relies on a dark, calm "global civic" aesthetic [1]. This design system prioritizes a modern, military-friendly, dark-native approach, ensuring clarity, neutrality, and accessibility [1].

## Color Palette

The core color palette is designed to signal stability and warmth while avoiding conflict-amplifying visual cues.

### Primary Colors

*   **Deep Navy** (`#0A0F1E`): The primary background color. It provides a calm, serious foundation for the platform, reducing eye strain and signaling a secure environment [1].
*   **Teal** (`#0E9AA7`): The primary accent color. Used for interactive elements, links, and highlights, it represents clarity, connection, and forward momentum [1].
*   **Amber** (`#F5A623`): The secondary accent color. Used sparingly for warnings, important notifications, and to add warmth to the interface [1].

### Secondary Colors

*   **Dark Gray** (`#1A202C`): Used for secondary backgrounds, cards, and panels to create depth and hierarchy.
*   **Light Gray** (`#E2E8F0`): Used for secondary text, borders, and subtle dividers.
*   **White** (`#FFFFFF`): Used for primary text on dark backgrounds to ensure high contrast and readability.

## Typography

Typography utilizes Space Grotesk or DM Sans to ensure clarity and neutrality [1]. We employ fluid typography, such as the CSS `clamp()` method, to ensure text scales perfectly across different screen sizes without awkward jumps, contributing to a polished and modern feel.

### Primary Font Family

*   **Space Grotesk**: Used for headings, titles, and key interface elements. Its geometric structure provides a modern, technical feel while remaining approachable.
*   **DM Sans**: Used for body copy, paragraphs, and long-form text. Its clean, sans-serif design ensures excellent legibility across all devices.

### Typography Scale (Fluid)

We use a fluid typography scale to maintain optimal readability across all viewport sizes. The following are approximate values; actual implementation uses CSS `clamp()`.

*   **Heading 1 (H1)**: `clamp(2rem, 5vw, 3rem)`
*   **Heading 2 (H2)**: `clamp(1.5rem, 4vw, 2.5rem)`
*   **Heading 3 (H3)**: `clamp(1.25rem, 3vw, 2rem)`
*   **Body Text**: `clamp(1rem, 1.5vw, 1.125rem)`
*   **Small Text**: `clamp(0.875rem, 1vw, 1rem)`

### Font Weights

*   **Regular (400)**: Standard body text and paragraphs.
*   **Medium (500)**: Subheadings and emphasized text within paragraphs.
*   **Bold (700)**: Primary headings and key call-to-action buttons.

## Accessibility

The UI components—including timeline sentiment bars and incident review panels—adhere strictly to WCAG AA accessibility standards [1]. This ensures sufficient contrast ratios between text and background colors, particularly when using the Deep Navy background.

## References

[1] MENDguild Core Research Compilation.
