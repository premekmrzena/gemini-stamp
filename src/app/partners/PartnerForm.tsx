'use client';

import { FormEvent, useState } from 'react';
import { CONTENT, PartnerLang } from './content';

type Status = 'idle' | 'sending' | 'success' | 'error';

type Props = { lang: PartnerLang; refCode: string | null; ctaClass: string };

const INPUT =
  'w-full bg-black border border-black300/30 rounded-[4px] px-4 py-3 style-body text-secondary placeholder:text-black300 focus:outline-none focus:border-primary';

// Poptávkový formulář pro CK - posílá na /api/partner-inquiry (Resend na info@).
// Nahradil mailto, které na mobilu bez nastaveného poštovního klienta nic neotevře.
export default function PartnerForm({ lang, refCode, ctaClass }: Props) {
  const f = CONTENT[lang].form;
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch('/api/partner-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ref: refCode, lang }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="style-perex text-center bg-black border border-success/40 rounded-[4px] px-6 py-5 max-w-[560px] w-full" role="status">
        {f.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[560px] flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="style-body-bold">{f.name} *</span>
          <input name="name" required autoComplete="name" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="style-body-bold">{f.agency} *</span>
          <input name="agency" required autoComplete="organization" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="style-body-bold">{f.email} *</span>
          <input name="email" type="email" required autoComplete="email" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="style-body-bold">{f.phone}</span>
          <input name="phone" type="tel" autoComplete="tel" className={INPUT} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="style-body-bold">{f.message}</span>
        <textarea name="message" rows={4} placeholder={f.messagePlaceholder} className={INPUT} />
      </label>
      {/* Honeypot - lidé ho nevidí, boti ho vyplní */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {status === 'error' && (
        <p className="style-body text-error" role="alert">
          {f.error}
        </p>
      )}
      <div className="flex justify-center mt-2">
        <button type="submit" disabled={status === 'sending'} className={`${ctaClass} cursor-pointer disabled:opacity-60`}>
          {status === 'sending' ? f.sending : f.submit}
        </button>
      </div>
    </form>
  );
}
