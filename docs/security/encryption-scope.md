# Encryption scope

## What is protected

- **Per-squad symmetric encryption (AES-GCM)** ensures ciphertext stored in `messages.encrypted_content` is only decipherable by clients that possess the squad’s `message_encryption_key`.
- Other squad members without the key cannot read message bodies from the database payload alone.

## What is not protected (today)

- **Supabase / Postgres at the SQL layer** can read **plaintext** if the application ever writes plaintext to the database or if keys are exposed in logs or misconfigured policies.
- **Per-user public-key end-to-end encryption** (so the server never sees decryptable content) is **not** implemented yet.

## Forward secrecy

- If the **squad key is compromised**, an attacker can decrypt **historical** messages encrypted with that key.
- For high-stakes sessions, consider **key rotation** or **archiving** after the session ends once those flows exist in the product.
