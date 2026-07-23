import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GovernedEntryLayout } from '../../components/shell/GovernedEntryLayout';
import { validateGovernedCredential } from '../../lib/validateGovernedCredential';

type ScanPhase =
  | 'ready'
  | 'detected'
  | 'validating'
  | 'confirmed'
  | 'routing'
  | 'unsupported'
  | 'error';

/**
 * QR handoff — BarcodeDetector when available; upload + manual fallback always.
 */
export function EnterQrPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<ScanPhase>('ready');
  const [message, setMessage] = useState('Camera ready — present the invitation QR.');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleToken = useCallback(
    async (token: string) => {
      setPhase('detected');
      setMessage('Code detected.');
      setPhase('validating');
      setMessage('Validating credential…');
      const result = await validateGovernedCredential(token);
      if (!result.ok) {
        setPhase('error');
        setMessage(result.message);
        return;
      }
      setPhase('confirmed');
      setMessage('Access confirmed.');
      setPhase('routing');
      setMessage('Routing to role entry…');
      navigate(result.continueHref);
    },
    [navigate],
  );

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function start() {
      const Detector = (
        window as unknown as {
          BarcodeDetector?: new (opts: { formats: string[] }) => {
            detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
          };
        }
      ).BarcodeDetector;

      if (!Detector || !navigator.mediaDevices?.getUserMedia) {
        setPhase('unsupported');
        setMessage(
          'Camera QR detection is unavailable in this browser. Upload an image or enter the credential manually.',
        );
        return;
      }

      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(media);
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          await videoRef.current.play();
        }
        const detector = new Detector({ formats: ['qr_code'] });
        timer = window.setInterval(() => {
          void (async () => {
            if (!videoRef.current || cancelled) return;
            try {
              const codes = await detector.detect(videoRef.current);
              const raw = codes[0]?.rawValue?.trim();
              if (raw) {
                window.clearInterval(timer);
                media.getTracks().forEach((t) => t.stop());
                await handleToken(raw);
              }
            } catch {
              /* keep scanning */
            }
          })();
        }, 700);
      } catch {
        setPhase('unsupported');
        setMessage('Camera permission denied. Upload an image or enter the credential manually.');
      }
    }

    void start();
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start once
  }, [handleToken]);

  async function onUpload(file: File | null) {
    if (!file) return;
    setPhase('detected');
    setMessage('Image received — validating…');
    // Without a decode library, treat filename-embedded demo tokens or prompt manual entry.
    const name = file.name.toLowerCase();
    const demoMatch = name.match(/demo-[a-z0-9-]+/);
    if (demoMatch) {
      await handleToken(demoMatch[0]);
      return;
    }
    setPhase('error');
    setMessage(
      'Could not decode this image in-browser. Enter the credential manually or use a device with BarcodeDetector support.',
    );
  }

  return (
    <GovernedEntryLayout title="QR handoff">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-h2 font-medium text-ink">Scan invitation QR</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Secure mobile handoff for invitation credentials. Camera processing stays on this device;
          the credential is single-purpose and does not expose room dialogue.
        </p>

        <div className="mt-8 overflow-hidden rounded-lg border border-line bg-surface-sunken">
          <video
            ref={videoRef}
            className="aspect-video w-full bg-black object-cover"
            muted
            playsInline
            aria-label="Invitation QR camera preview"
          />
        </div>

        <p
          className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-ink-faint"
          role="status"
          aria-live="polite"
        >
          {phase.replace('_', ' ')} · {message}
        </p>

        <ol className="mt-4 m-0 flex list-none flex-wrap gap-2 p-0 text-xs text-ink-faint">
          {(['ready', 'detected', 'validating', 'confirmed', 'routing'] as const).map((s) => (
            <li
              key={s}
              className={`rounded-sm border px-2 py-1 ${
                phase === s ? 'border-brand text-brand' : 'border-line'
              }`}
            >
              {s}
            </li>
          ))}
        </ol>

        <label className="mt-8 block text-sm text-ink-secondary">
          Upload QR image
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm"
            onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
          />
        </label>

        <p className="mt-6 text-sm text-ink-faint">
          <Link to="/enter/credential" className="text-brand">
            Enter invitation credential manually
          </Link>
        </p>
      </div>
    </GovernedEntryLayout>
  );
}
