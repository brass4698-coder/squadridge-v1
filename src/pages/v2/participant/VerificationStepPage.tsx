import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenShell } from '../../../components/layout/TokenShell';
import { PilotVerificationNotice } from '../../../components/participant/PilotVerificationNotice';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { useParticipantSession } from '../../../hooks/useParticipantSession';
import { participantRoute } from '../../../lib/participantRoutes';
import { recordParticipantContactHash } from '../../../lib/participantToken';
import { uploadParticipantVerificationDocument } from '../../../lib/participantVerification';

type Step = 'email' | 'identity' | 'complete';

export function VerificationStepPage() {
  const token = useParticipantToken();
  const { ctx, loading: sessionLoading } = useParticipantSession(token ?? '');
  // Wait for token context so demo / non-ID sessions do not force document upload.
  const identityRequired = ctx?.identity_verification_required === true;
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  async function confirmEmail() {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      setEmailError('Enter a valid organisational email address.');
      return;
    }
    if (!token || sessionLoading) return;
    setEmailError('');
    const result = await recordParticipantContactHash(token, email.trim());
    if (!result.valid) {
      setEmailError(result.error ?? 'Could not record email. Try again.');
      return;
    }
    const needsIdentity = ctx?.identity_verification_required === true;
    setStep(needsIdentity ? 'identity' : 'complete');
  }

  async function submitIdentity() {
    if (!token || !file) return;
    setUploadError('');
    setUploading(true);
    const result = await uploadParticipantVerificationDocument(token, file);
    setUploading(false);
    if (!result.ok) {
      setUploadError(result.error ?? 'Upload failed. Try again.');
      return;
    }
    setStep('complete');
  }

  function proceed() {
    if (!token) return;
    navigate(participantRoute('consent', token));
  }

  if (!token) return null;

  const inputCls =
    'w-full rounded border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]';
  const inputStyle = (err: boolean) => ({
    borderColor: err ? 'var(--color-danger)' : 'var(--color-border)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-primary)',
  });

  return (
    <TokenShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div
          className="w-full max-w-md rounded-xl border p-10"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <PilotVerificationNotice />

          {step === 'email' && (
            <>
              <h1
                className="mb-2 text-xl font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Confirm your email
              </h1>
              <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Enter the email your facilitator expects for this session. We store only a one-way
                hash — not the address itself — for eligibility matching.
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Organisational email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    className={inputCls}
                    style={inputStyle(!!emailError)}
                    placeholder="you@organisation.org"
                    aria-invalid={!!emailError}
                  />
                  {emailError && (
                    <p
                      role="alert"
                      className="mt-1.5 text-xs"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      {emailError}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void confirmEmail()}
                  disabled={sessionLoading}
                  className="rounded py-2.5 text-sm font-medium text-white disabled:opacity-40"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  {sessionLoading ? 'Loading…' : 'Continue'}
                </button>
              </div>
            </>
          )}

          {step === 'identity' && (
            <>
              <h1
                className="mb-2 text-xl font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Identity document
              </h1>
              <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Upload a passport, national ID, or driver&apos;s licence for facilitator review.
                Files are stored in a private vault — never published to the ledger or shared with
                other participants.
              </p>
              <div
                className="mb-6 rounded-lg border-2 border-dashed p-8 text-center"
                style={{
                  borderColor: file ? 'var(--color-success)' : 'var(--color-border)',
                }}
              >
                {file ? (
                  <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                    {file.name} selected
                  </p>
                ) : (
                  <>
                    <p className="mb-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      JPG, PNG, or PDF — max 5 MB
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      className="text-xs"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] ?? null);
                        setUploadError('');
                      }}
                      aria-label="Upload identity document"
                    />
                  </>
                )}
              </div>
              {uploadError && (
                <p role="alert" className="mb-4 text-xs" style={{ color: 'var(--color-danger)' }}>
                  {uploadError}
                </p>
              )}
              <button
                type="button"
                onClick={() => void submitIdentity()}
                disabled={!file || uploading}
                className="w-full rounded py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                {uploading ? 'Uploading…' : 'Submit for review'}
              </button>
            </>
          )}

          {step === 'complete' && (
            <>
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                style={{
                  backgroundColor: 'var(--color-accent-light)',
                  color: 'var(--color-accent)',
                }}
                aria-hidden="true"
              >
                ✓
              </div>
              <h1
                className="mb-2 text-xl font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {identityRequired ? 'Verification submitted' : 'Email recorded'}
              </h1>
              <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {identityRequired
                  ? 'Your materials were sent to the facilitator for review. Once approved, you can enter the protected session.'
                  : 'Your facilitator will confirm eligibility before the session opens.'}
              </p>
              <button
                type="button"
                onClick={proceed}
                className="w-full rounded py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                Continue to consent →
              </button>
            </>
          )}
        </div>
      </div>
    </TokenShell>
  );
}
