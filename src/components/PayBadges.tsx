function PayBadge({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-black300/30 text-black300 style-label font-semibold">
      {icon}
      {children}
    </span>
  );
}

export function ApplePayBadge() {
  return (
    <PayBadge
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 5.8c1.6-1.9 1.4-3.9 1.4-3.9s-1.9.1-3.3 1.7c-1.3 1.4-1.5 3.3-1.5 3.3s1.9.1 3.4-1.1z" />
          <path d="M17.6 12.5c0-2.9 2.4-4.3 2.5-4.4-1.4-2-3.5-2.3-4.2-2.3-1.8-.2-3.5 1-4.4 1-.9 0-2.3-1-3.8-1-2 0-3.8 1.1-4.8 2.9-2.1 3.6-.5 8.9 1.5 11.8 1 1.4 2.1 3 3.6 2.9 1.5-.1 2-.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.5-2.8.9-1.3 1.5-2.7 1.6-2.8-1.7-.7-3.5-3.6-3.9-6.3z" />
        </svg>
      }
    >
      Pay
    </PayBadge>
  );
}

export function GooglePayBadge() {
  return (
    <PayBadge
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12a8 8 0 1 1-2.9-6.2" />
          <path d="M20 12h-7" />
        </svg>
      }
    >
      Pay
    </PayBadge>
  );
}
