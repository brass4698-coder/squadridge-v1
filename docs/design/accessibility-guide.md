# Accessibility Guide

## Overview

MENDguild is designed to support verified-anonymous, cross-border dialogue for users in diverse and often challenging environments [1]. To ensure that voices from non-dominant cultures, rural areas, and active conflict zones are not marginalized, our platform adheres strictly to WCAG AA accessibility standards [1].

## Core Principles

### 1. Visual Accessibility

The visual identity relies on a dark, calm "global civic" aesthetic, featuring a deep navy background (`#0A0F1E`) with teal (`#0E9AA7`) and amber (`#F5A623`) accents [1].

*   **Contrast Ratios**: All text and interactive elements must meet or exceed WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text) against their background. The Deep Navy background provides an excellent foundation for high-contrast, legible text.
*   **Color as Information**: Color is never used as the sole means of conveying information. Critical alerts (such as the "Pull back" feature) use both color (Amber) and explicit text/iconography to ensure comprehension for users with color vision deficiencies [1].
*   **Typography**: We utilize Space Grotesk or DM Sans to ensure clarity and neutrality [1]. We employ fluid typography, such as the CSS `clamp()` method, to ensure text scales perfectly across different screen sizes without awkward jumps.

### 2. Cognitive Accessibility

Our UX copy emphasizes safety and reflection, counteracting the rapid reaction times demanded by traditional social platforms [1].

*   **Clear Language**: We use simple, straightforward sentences, avoiding jargon and idioms. This is crucial given the diverse linguistic backgrounds of our users [3].
*   **Predictability**: UI components—including timeline sentiment bars and incident review panels—behave consistently across the platform [1].
*   **Interventions**: The "Power of Pause" is a core UX pattern. Interventions like the one-tap "Slow down" button are clearly explained during onboarding, ensuring users are not surprised or confused by AI-assisted de-escalation [1].

### 3. Technical Accessibility

MENDguild is built on a React, Vite, and TypeScript frontend, supported by a horizontally scalable Node.js backend [1].

*   **Keyboard Navigation**: All interactive elements are fully accessible via keyboard, ensuring users who cannot use a mouse can navigate the platform effectively.
*   **Screen Readers**: Semantic HTML and ARIA attributes are used throughout the application to ensure compatibility with screen readers.
*   **Low-Bandwidth Optimization**: Recognizing the "digital divide," the platform is designed to operate efficiently in low-bandwidth environments [3]. This ensures inclusivity for users in active conflict zones with severely degraded internet infrastructure [3].

## References

[1] MENDguild Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
