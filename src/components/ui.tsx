import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Minus, Landmark } from 'lucide-react';
import { number } from '../engine/data';
export function Seal({ small = false }: { small?: boolean }) {
  return (
    <div className={`seal ${small ? 'small' : ''}`} aria-hidden="true">
      <Landmark size={small ? 19 : 25} strokeWidth={1.3} />
    </div>
  );
}
export function Panel({
  title,
  eyebrow,
  action,
  children,
  className = '',
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-head">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Bar({
  value,
  color = 'gold',
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  return (
    <div
      className={`bar ${color}`}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label ?? 'Indicador'}
    >
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
export function Delta({
  value,
  inverse = false,
  suffix = 'p.p.',
}: {
  value: number;
  inverse?: boolean;
  suffix?: string;
}) {
  const good = inverse ? value < 0 : value > 0;
  const Icon = Math.abs(value) < 0.005 ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`delta ${Math.abs(value) < 0.005 ? 'neutral' : good ? 'positive' : 'negative'}`}
    >
      <Icon size={12} />
      {value > 0 ? '+' : ''}
      {number(value, Math.abs(value) < 0.1 ? 2 : 1)} {suffix}
    </span>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const old = document.activeElement as HTMLElement;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
      if (e.key === 'Tab') {
        const els = ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]',
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = original;
      old?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal ${wide ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={ref}
      >
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Architecture({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`architecture ${className}`}
      viewBox="0 0 1100 660"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="building"
          x1="0"
          y1="120"
          x2="0"
          y2="540"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#35424c" />
          <stop offset="1" stopColor="#17242e" />
        </linearGradient>
        <pattern id="windows" width="10" height="15" patternUnits="userSpaceOnUse">
          <path d="M2 0v10" stroke="#879098" strokeOpacity=".2" />
        </pattern>
      </defs>
      <path d="M0 529h1100M0 553h1100M0 587h1100M0 630h1100" stroke="#c5a46d" strokeOpacity=".12" />
      <path
        d="m0 660 550-131 550 131M150 660l400-131 400 131M340 660l210-131 210 131M480 660l70-131 70 131"
        stroke="#c5a46d"
        strokeOpacity=".08"
      />
      <path d="M102 458h896v71H102z" fill="url(#building)" stroke="#a6a59d" strokeOpacity=".3" />
      <path d="M114 470h872v38H114z" fill="url(#windows)" />
      <path
        d="M468 146h65v312h-65zM545 146h65v312h-65z"
        fill="url(#building)"
        stroke="#9da4a6"
        strokeOpacity=".45"
      />
      <path d="M472 151h57v303h-57zM549 151h57v303h-57z" fill="url(#windows)" />
      <path d="M533 146h12v312h-12" fill="#0f1b25" />
      <path d="M443 146h191" stroke="#c5a46d" strokeOpacity=".6" />
      <path
        d="M205 451c5-80 153-80 158 0z"
        fill="url(#building)"
        stroke="#abb1b2"
        strokeOpacity=".4"
      />
      <path
        d="M695 385c7 92 159 92 166 0z"
        fill="url(#building)"
        stroke="#abb1b2"
        strokeOpacity=".5"
      />
      <path d="M684 385h188" stroke="#c5a46d" strokeOpacity=".6" />
      <path d="M198 451h173M90 529h920" stroke="#c5a46d" strokeOpacity=".55" />
      <path
        d="M875 450V289m0 0v-25m0 25c14-12 22 13 38-1v44c-16 12-24-12-38 0"
        stroke="#c5a46d"
        strokeOpacity=".5"
      />
      <path d="M136 458h824M136 465h824" stroke="#c5a46d" strokeOpacity=".1" />
      <circle cx="541" cy="302" r="212" stroke="#c5a46d" strokeOpacity=".055" />
      <circle cx="541" cy="302" r="260" stroke="#c5a46d" strokeOpacity=".035" />
    </svg>
  );
}
export function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty">
      <Landmark size={26} />
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  );
}
