import { useState } from 'react';
import { domainAPI } from '../api/services';

const METHODS = [
  {
    id: 'DNS_TXT',
    label: 'DNS TXT Record',
    icon: '🌐',
    desc: 'Most reliable. Add a TXT record to your DNS. Works for all domains.',
    badge: 'Recommended',
    badgeColor: '#6ec896',
  },
  {
    id: 'META_TAG',
    label: 'HTML Meta Tag / File',
    icon: '🏷',
    desc: 'Quick. Add a meta tag to your homepage or upload a verification file.',
    badge: 'Fastest',
    badgeColor: '#c8a96e',
  },
  {
    id: 'WHOIS_EMAIL',
    label: 'WHOIS Email',
    icon: '📧',
    desc: 'Receive a code at the registered owner email from WHOIS records.',
    badge: 'Easy',
    badgeColor: '#6eadc8',
  },
];

export default function DomainVerificationModal({ domain, onClose, onVerified }) {
  const [step, setStep]           = useState('choose');   // choose | instructions | check | done
  const [method, setMethod]       = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [otpCode, setOtpCode]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [checkResult, setCheckResult]   = useState(null);
  const [error, setError]         = useState('');

  const fullDomain = domain.domainName + domain.domainExtension;

  // ── Step 1: Init ────────────────────────────────────────────────────────────
  const handleInit = async (selectedMethod) => {
    setLoading(true); setError('');
    try {
      const { data } = await domainAPI.verifyInit(domain.id, selectedMethod);
      setMethod(selectedMethod);
      setInstructions(data);
      setStep('instructions');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || 'Failed to initiate verification.');
    } finally { setLoading(false); }
  };

  // ── Step 2: Check ───────────────────────────────────────────────────────────
  const handleCheck = async () => {
    setLoading(true); setError(''); setCheckResult(null);
    try {
      const { data } = await domainAPI.verifyCheck(
        domain.id,
        method === 'WHOIS_EMAIL' ? otpCode : null
      );
      setCheckResult(data);
      if (data.verified) {
        setStep('done');
        onVerified();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification check failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* ── Choose method ── */}
        {step === 'choose' && (
          <>
            <div className="modal-header">
              <div className="modal-badge">Domain Verification</div>
              <h2>{fullDomain}</h2>
              <p>Prove you own this domain to get a verified badge on your listing.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1.5rem 0' }}>
              {METHODS.map(m => (
                <div key={m.id}
                  onClick={() => !loading && handleInit(m.id)}
                  style={{
                    padding: '1rem 1.25rem', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                    transition: 'all 0.15s', opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{m.icon}</span>
                    <span style={{ fontWeight: 600, color: '#e0e0f0', fontSize: '0.95rem' }}>{m.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700,
                                   color: m.badgeColor, background: `${m.badgeColor}18`,
                                   border: `1px solid ${m.badgeColor}33`,
                                   padding: '0.15rem 0.5rem', borderRadius: 4 }}>
                      {m.badge}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', paddingLeft: '2rem' }}>{m.desc}</p>
                </div>
              ))}
            </div>

            {error && <div className="form-error">{error}</div>}
            {loading && <div style={{ textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>
              <span className="btn-spinner" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
              Initiating verification…
            </div>}
          </>
        )}

        {/* ── Instructions ── */}
        {step === 'instructions' && instructions && (
          <>
            <div className="modal-header">
              <div className="modal-badge">
                {METHODS.find(m => m.id === method)?.icon} {METHODS.find(m => m.id === method)?.label}
              </div>
              <h2>Follow these steps</h2>
            </div>

            {/* Step-by-step instructions */}
            <div style={{ margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {instructions.instructions?.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(200,169,110,0.15)',
                                  border: '1px solid rgba(200,169,110,0.3)', color: '#c8a96e',
                                  fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '0.83rem', color: '#c0c0d0', lineHeight: 1.5 }}>{line}</span>
                </div>
              ))}
            </div>

            {/* DNS TXT copy box */}
            {method === 'DNS_TXT' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={labelStyle}>TXT Record Value</div>
                <CopyBox value={instructions.recordValue} />
              </div>
            )}

            {/* Meta tag copy box */}
            {method === 'META_TAG' && (
              <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={labelStyle}>Meta Tag</div>
                  <CopyBox value={instructions.metaTag} mono />
                </div>
                <div>
                  <div style={labelStyle}>OR — File Path & Content</div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem' }}>
                    Upload to: <code style={{ color: '#c8a96e' }}>{instructions.filePath}</code>
                  </div>
                  <CopyBox value={instructions.fileContent} />
                </div>
              </div>
            )}

            {/* WHOIS email OTP input */}
            {method === 'WHOIS_EMAIL' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={labelStyle}>Enter Verification Code</div>
                <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.75rem' }}>
                  Sent to: <strong style={{ color: '#c8a96e' }}>{instructions.maskedEmail}</strong>
                </p>
                <input
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  style={{ letterSpacing: '0.3em', fontSize: '1.1rem', textAlign: 'center' }}
                />
              </div>
            )}

            {checkResult && !checkResult.verified && (
              <div style={{ padding: '0.875rem 1rem', background: 'rgba(200,110,110,0.08)',
                            border: '1px solid rgba(200,110,110,0.25)', borderRadius: 8,
                            marginBottom: '1rem', fontSize: '0.83rem', color: '#c86e6e' }}>
                ✕ {checkResult.message}
              </div>
            )}

            {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={handleCheck} disabled={loading} style={{ flex: 1 }}>
                {loading
                  ? <><span className="btn-spinner" /> Checking…</>
                  : method === 'WHOIS_EMAIL' ? 'Verify Code →' : 'Check Verification →'
                }
              </button>
              <button className="btn-ghost" onClick={() => { setStep('choose'); setCheckResult(null); setError(''); }}>
                ← Back
              </button>
            </div>

            {method !== 'WHOIS_EMAIL' && (
              <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.75rem', textAlign: 'center' }}>
                {method === 'DNS_TXT'
                  ? 'DNS changes can take a few minutes to propagate. If it fails, wait 5 mins and try again.'
                  : 'Make sure your website is publicly accessible before checking.'}
              </p>
            )}
          </>
        )}

        {/* ── Success ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              Domain Verified!
            </h2>
            <p style={{ color: '#a0a0b0', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#6ec896' }}>{fullDomain}</strong> is now verified.
              Your listing shows a verified badge to buyers.
            </p>
            <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Copy box component ────────────────────────────────────────────────────────
function CopyBox({ value, mono }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '0.75rem 1rem' }}>
      <code style={{ flex: 1, fontSize: mono ? '0.72rem' : '0.82rem',
                     color: '#c8a96e', wordBreak: 'break-all', fontFamily: 'monospace' }}>
        {value}
      </code>
      <button onClick={handleCopy}
        style={{ background: copied ? 'rgba(110,200,150,0.15)' : 'rgba(255,255,255,0.07)',
                 border: `1px solid ${copied ? 'rgba(110,200,150,0.3)' : 'rgba(255,255,255,0.1)'}`,
                 borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer',
                 color: copied ? '#6ec896' : '#888', fontSize: '0.75rem', whiteSpace: 'nowrap',
                 transition: 'all 0.2s' }}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.72rem', fontWeight: 600, color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem'
};