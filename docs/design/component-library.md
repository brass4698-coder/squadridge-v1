# Component Library

## Overview

The SquadRidge Component Library is a collection of reusable UI elements built with React, TypeScript, and TailwindCSS [1]. These components adhere strictly to our "global civic" aesthetic, prioritizing a modern, military-friendly, dark-native design system [1].

## Core Components

The library is designed to support verified-anonymous, cross-border dialogue by providing clear, accessible, and responsive interfaces [1].

### 1. Typography and Layout

Typography utilizes Space Grotesk or DM Sans to ensure clarity and neutrality [1]. We employ fluid typography, such as the CSS `clamp()` method, to ensure text scales perfectly across different screen sizes without awkward jumps.

*   **Headings**: `H1` through `H6` components utilizing Space Grotesk for geometric, technical clarity.
*   **Body Text**: `Text` components utilizing DM Sans for optimal legibility in long-form dialogue.
*   **Containers**: `Card` and `Panel` components featuring our Deep Navy background (`#0A0F1E`) to reduce eye strain [1].

### 2. Interactive Elements

Interactive components are designed to provide clear affordances and tactile feedback, crucial for high-stress dialogue environments.

*   **Buttons**: Designed using neo-skeuomorphism principles. This approach provides tactile feedback and clear affordances. Primary buttons utilize our Teal accent (`#0E9AA7`), while warning actions use Amber (`#F5A623`) [1].
*   **Inputs**: Text areas and input fields designed for low-bandwidth environments, ensuring smooth performance even with degraded internet infrastructure [3].

### 3. Specialized Dialogue Components

These components are unique to SquadRidge's mission of de-escalating geopolitical tensions [1].

*   **Timeline Sentiment Bars**: Visual indicators that track the emotional tone of a dialogue session, alerting users and facilitators to rising tension [1].
*   **Incident Review Panels**: Interfaces for moderators and analysts to review flagged exchanges, designed to present complex data clearly [1].
*   **Intervention Prompts**: In-room prompts that actively guide users through structured digital dialogue frameworks, such as the "Slow down" button or the "Pull back" feature [1].

## Accessibility and Implementation

All components adhere strictly to WCAG AA accessibility standards [1]. This ensures sufficient contrast ratios between text and background colors, particularly when using the Deep Navy background.

The components are implemented as functional React components, utilizing TailwindCSS for styling. They are designed to be highly customizable via props while maintaining strict adherence to the core design system.

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
