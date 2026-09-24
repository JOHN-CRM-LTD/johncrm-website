import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { INDUSTRIES } from '../industries/catalog';
import '../../styles/industries-menu.css';

export default function IndustriesMenu({ language, mobile = false, onNavigate }: {
  language: 'EN' | 'CN' | 'HK';
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const id = useId();
  const cancelClose = () => clearTimeout(closeTimer.current);
  const close = () => { cancelClose(); setOpen(false); };

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  return <div ref={ref} className={`industries-menu${mobile ? ' industries-menu--mobile' : ''}`} data-open={open}
    onPointerEnter={event => {
      if (!mobile && event.pointerType === 'mouse') { cancelClose(); setOpen(true); }
    }}
    onPointerLeave={event => {
      if (!mobile && event.pointerType === 'mouse') closeTimer.current = setTimeout(close, 180);
    }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); trigger.current?.focus(); }
    }}>
    <button ref={trigger} type="button" className="industries-menu__trigger" aria-expanded={open} aria-controls={id}
      onClick={() => { cancelClose(); setOpen(value => !value); }}
      onKeyDown={event => {
        if (event.key === 'ArrowDown') {
          event.preventDefault(); cancelClose(); setOpen(true);
          requestAnimationFrame(() => ref.current?.querySelector<HTMLAnchorElement>('a')?.focus());
        }
      }}>
      {language === 'EN' ? 'Industries' : language === 'HK' ? '行業' : '行业'}
      <ChevronDown size={13} aria-hidden="true" />
    </button>
    <div className="industries-menu__bridge">
      <div id={id} className="industries-menu__panel" hidden={!open}>
        {INDUSTRIES.map(({ slug, name, icon: Icon, description, cn, hk }) => <a key={slug} href={`/industries/${slug}`}
          aria-current={typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '') === `/industries/${slug}` ? 'page' : undefined}
          onClick={() => { close(); onNavigate?.(); }}>
          <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
          <span><strong>{language === 'EN' ? name : language === 'HK' ? hk : cn}</strong>
            {language === 'EN' && <small>{description}</small>}</span>
          <ArrowUpRight className="industries-menu__arrow" size={16} aria-hidden="true" />
        </a>)}
      </div>
    </div>
  </div>;
}
