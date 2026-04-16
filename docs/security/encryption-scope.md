# Encryption scope

## What is protected

- **Per-squad symmetric encryption (AES-GCM)** stores ciphertext in `messages.payload_ciphertext` (JSON blob). Clients with the squad’s `message_encryption_key` can decrypt; the operator can also read keys and ciphertext — see the [threat model](threat-model.md).
- Other squad members without the key cannot read message bodies from the database payload alone.

## What is not protected (today)

- **Supabase / Postgres at the SQL layer** can read **plaintext** if the application ever writes plaintext to the database or if keys are exposed in logs or misconfigured policies.
- **Per-user public-key end-to-end encryption** (so the server never sees decryptable content) is **not** implemented yet.

## Forward secrecy

- If the **squad key is compromised**, an attacker can decrypt **historical** messages encrypted with that key.
- For high-stakes sessions, consider **key rotation** or **archiving** after the session ends once those flows exist in the product.

## Future work (RFC)

- A **stronger key hierarchy** (operator-blind E2E) is under design; see [`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md). Do not claim E2E in marketing until that RFC is implemented and reviewed.
