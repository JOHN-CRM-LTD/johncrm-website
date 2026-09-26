import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, ChevronDown, MessageCircle } from 'lucide-react';
import '../../styles/industries-menu.css';

const SUPPORT_COPY = {
  EN: { label: 'Support', docs: 'Developer Documentation', contact: 'Contact us', docsHint: 'Get more from JOHN CRM.', contactHint: 'Talk with our team.' },
  CN: { label: '支持', docs: '开发者文档', contact: '联系我们', docsHint: '充分发挥 JOHN CRM 的功能。', contactHint: '与我们的团队联系。' },
  HK: { label: '支援', docs: '開發者文件', contact: '聯絡我們', docsHint: '充分發揮 JOHN CRM 的功能。', contactHint: '與我們的團隊聯絡。' },
} as const;

export default function SupportMenu({ language, home = false, mobile = false, onNavigate }: {
  language: 'EN' | 'CN' | 'HK';
  home?: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const id = useId();
  const copy = SUPPORT_COPY[language];
  const cancelClose = () => clearTimeout(closeTimer.current);
  const close = () => { cancelClose(); setOpen(false); };
  const links = [
    { href: '/docs', label: copy.docs, description: copy.docsHint, icon: BookOpen },
    { href: home ? '#contact' : '/#contact', label: copy.contact, description: copy.contactHint, icon: MessageCircle },
  ];

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  return <div ref={ref} className={`industries-menu support-menu${mobile ? ' industries-menu--mobile' : ''}`} data-open={open}
    onPointerEnter={event => {
      if (!mobile && event.pointerType === 'mouse') { cancelClose(); setOpen(true); }
    }}
    onPointerLeave={event => {
      if (!mobile && event.pointerType === 'mouse') closeTimer.current = setTimeout(close, 180);
    }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    onKeyDown={event => {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); close(); trigger.current?.focus();
      }
    }}>
    <button ref={trigger} type="button" className="industries-menu__trigger" aria-expanded={open} aria-controls={id}
      onClick={() => { cancelClose(); setOpen(value => !value); }}
      onKeyDown={event => {
        if (event.key === 'ArrowDown') {
          event.preventDefault(); cancelClose(); setOpen(true);
          requestAnimationFrame(() => ref.current?.querySelector<HTMLAnchorElement>('a')?.focus());
        }
      }}>
      {copy.label}<ChevronDown size={13} aria-hidden="true" />
    </button>
    <div className="industries-menu__bridge">
      <div id={id} className="industries-menu__panel" hidden={!open}>
        {links.map(({ href, label, description, icon: Icon }) => <a key={href} href={href}
          aria-current={href === '/docs' && typeof window !== 'undefined' && /^\/docs(?:\/|$)/.test(window.location.pathname) ? 'true' : undefined}
          onClick={() => { close(); onNavigate?.(); }}>
          <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
          <span><strong>{label}</strong><small>{description}</small></span>
          <ArrowUpRight className="industries-menu__arrow" size={16} aria-hidden="true" />
        </a>)}
      </div>
    </div>
  </div>;
}
