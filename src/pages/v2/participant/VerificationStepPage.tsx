import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipantToken } from '../../../hooks/useParticipantToken';

type Step = 'email' | 'identity' | 'complete';

export function VerificationStepPage() {
  const token = useParticipantToken();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const navigate = useNavigate();

  function sendCode() {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      setEmailError('Enter a valid organisational email address.');
      return;
    }
    setEmailError('');
    setCodeSent(true);
  }

  function verifyCode() {
    if (codeInput.trim().length < 4) {
      setCodeError('Enter the 6-digit code from your email.');
      return;
    }
    setCodeError('');
    setStep('identity');
  }

  function submitIdentity() {
    setTimeout(() => setStep('complete'), 600);
  }

  function proceed() {
    navigate(`/p/consent/${token}`);
  }

  const inputCls =
    'w-full rounded border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]';
  const inputStyle = (err: boolean) => ({
    borderColor: err ? 'var(--color-danger)' : 'var(--color-border)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-primary)',
  });

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-md rounded-xl border p-10"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Progress */}
        <div className="mb-8 flex items-center gap-3">
          {(['email', 'identity', 'complete'] as Step[]).map((s, i) => {
            const done = ['email', 'identity', 'complete'].indexOf(step) > i;
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: active
                      ? 'var(--color-accent)'
                      : done
                        ? 'var(--color-accent-light)'
                        : 'var(--color-border)',
                    color: active
                      ? '#fff'
                      : done
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                  }}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span
                  className="text-xs capitalize"
                  style={{
                    color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  {s === 'complete' ? 'Done' : s}
                </span>
                {i < 2 && (
                  <div className="h-px w-6" style={{ backgroundColor: 'var(--color-border)' }} />
                )}
              </div>
            );
          })}
        </div>

        <p
          className="mb-6 text-xs leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
          data-testid="verify-next-hint"
        >
          Involvement · verifying — what happens next: confirm email → prove eligibility → consent →
          briefing → waiting room. Nothing from this step is published to the ledger.
        </p>

        {step === 'email' && (
          <>
            <h1
              className="mb-2 text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Confirm your email
            </h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Enter your organisational email address. We will send a one-time code to confirm you
              are eligible to participate.
            </p>
            {!codeSent ? (
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
                  onClick={sendCode}
                  className="rounded py-2.5 text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  Send Verification Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  A 6-digit code was sent to{' '}
                  <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>. Enter it
                  below.
                </p>
                <div>
                  <label
                    htmlFor="code"
                    className="mb-1.5 block text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Verification code
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value);
                      setCodeError('');
                    }}
                    className={inputCls}
                    style={inputStyle(!!codeError)}
                    placeholder="000000"
                    aria-invalid={!!codeError}
                  />
                  {codeError && (
                    <p
                      role="alert"
                      className="mt-1.5 text-xs"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      {codeError}
                    </p>
                  )}
                </div>
                <button
                  onClick={verifyCode}
                  className="rounded py-2.5 text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  Confirm Code
                </button>
                <button
                  onClick={() => setCodeSent(false)}
                  className="text-xs underline"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Use a different email
                </button>
              </div>
            )}
          </>
        )}

        {step === 'identity' && (
          <>
            <h1
              className="mb-2 text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Identity document review
            </h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This session requires an identity document for facilitator review. Your document will
              not be shared publicly. It is used only to confirm your eligibility.
            </p>
            <div
              className="mb-6 rounded-lg border-2 border-dashed p-8 text-center"
              style={{ borderColor: fileUploaded ? 'var(--color-success)' : 'var(--color-border)' }}
            >
              {fileUploaded ? (
                <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                  Document uploaded ✓
                </p>
              ) : (
                <>
                  <p className="mb-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Drag a file here, or click to select
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Accepted: passport, national ID, driver's licence (JPG, PNG, or PDF — max 5 MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="mt-4 text-xs"
                    onChange={() => setFileUploaded(true)}
                    aria-label="Upload identity document"
                  />
                </>
              )}
            </div>
            <button
              onClick={submitIdentity}
              disabled={!fileUploaded}
              className="w-full rounded py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Submit for Review
            </button>
          </>
        )}

        {step === 'complete' && (
          <>
            <div
              className="mb-6 flex h-12 w-12 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
              aria-hidden="true"
            >
              ✓
            </div>
            <h1
              className="mb-2 text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Verification submitted
            </h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Your verification materials have been sent to the facilitator for review. Once
              approved, you will receive a confirmation and can proceed to the session.
            </p>
            <button
              onClick={proceed}
              className="w-full rounded py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Continue to Consent & Briefing →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
