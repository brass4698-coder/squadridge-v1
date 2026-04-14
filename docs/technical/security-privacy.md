# Security and Privacy

## Overview

SquadRidge is built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), prioritizing the safety of its users, especially those in authoritarian or active conflict zones [1]. The platform's security architecture is designed to mitigate the risks of state-level surveillance, data breaches, and the weaponization of sensitive information [3].

## Core Security Principles

### 1. Verified Anonymity via Zero-Knowledge Proofs

Participants in authoritarian or active conflict zones face real danger if their identities, locations, or stated views are exposed [3]. General platforms like Zoom or Google Workspace do not offer meaningful anonymization or prevent state-level surveillance [3].

SquadRidge addresses this by utilizing Semaphore-based zero-knowledge proofs (ZKPs) to verify user attributes like citizenship or organizational roles without exposing raw personally identifiable information (PII) [1]. This ensures that users can cryptographically prove their identity and participate in cross-border dialogue while their underlying personal data remains hidden [3].

### 2. End-to-End Encryption and Ephemerality

To minimize data at risk, SquadRidge employs end-to-end encryption for all sensitive exchanges [3]. The data pipeline strictly separates ephemeral, encrypted messaging streams from aggregated analytics [1].

Messages are designed for ephemerality; they are automatically deleted after a session concludes or upon user request (e.g., the temporary "Pull back" feature for immediate message retraction) [1]. This minimizes the risk of exposure if a device is seized or a server is compromised [3].

### 3. "Do No Harm" Data Architecture

The peace-tech ecosystem faces ethical concerns regarding the weaponization of data collected in conflict zones [3]. SquadRidge's architecture implements "do no harm" principles from the design phase, ensuring that the data infrastructure serves community needs without extractive practices [2].

The platform aggregates de-identified sentiment metrics to provide early warning insights for vetted mediators, think tanks, and UN agencies [1]. This data is strictly separated from the ephemeral messaging streams, ensuring that even if the analytics database is compromised, raw dialogue and user identities remain secure [1].

## Threat Modeling and Operational Security

SquadRidge incorporates best practices for digital safety in conflict zones, including threat-aware planning, strong encryption, and disciplined operational security [3].

### 1. Mitigating Surveillance Risks

The platform is designed to operate efficiently in low-bandwidth environments, which is critical for users in active conflict zones with degraded internet infrastructure [3]. It supports the use of anonymity networks like Tor and VPNs to evade network-level censorship and hide usage from ISPs [3].

### 2. Device Hygiene and Data Minimization

Users are encouraged to practice metadata hygiene, such as avoiding mentioning locations or timestamps in messages [3]. The platform's low-data mode minimizes the amount of information transferred, and users are advised to use separate accounts for different operational contexts to prevent cross-contamination [3].

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
