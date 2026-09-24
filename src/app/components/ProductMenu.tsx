import { useEffect, useId, useRef, useState } from 'react';
import { Bot, Cable, ChevronDown, Globe, Mail, MessageCircle, MessageSquare, Phone, Zap } from 'lucide-react';
import '../../styles/product-menu.css';

export const PRODUCTS = [
  { slug: 'john-ai', name: 'JOHN AI', icon: Bot, description: 'A better conversation starts here.' },
  { slug: 'automations', name: 'Automations', icon: Zap, description: 'Thoughtful workflows. On repeat.' },
  { slug: 'integrations', name: 'Integrations', icon: Cable, description: 'Your knowledge, connected.' },
] as const;
export type ProductSlug = (typeof PRODUCTS)[number]['slug'];
export const CHANNELS = [
  { name: 'Webchat', icon: Globe },
  { name: 'WhatsApp', icon: MessageCircle },
  { name: 'Email', icon: Mail },
  { name: 'SMS', icon: MessageSquare },
  { name: 'Voice', icon: Phone },
] as const;

export default function ProductMenu({ language, mobile = false, onNavigate }: {
  language: 'EN' | 'CN' | 'HK';
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const id = useId();
  const chinese = language !== 'EN';
  const traditional = language === 'HK';
  const home = typeof window !== 'undefined' && window.location.pathname === '/' ? '' : '/';
  const cancelClose = () => clearTimeout(timer.current);
  const close = () => { cancelClose(); setOpen(false); };

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  return (
    <div ref={ref} className={`product-menu${mobile ? ' product-menu--mobile' : ''}`} data-open={open}
      onPointerEnter={event => { if (!mobile && event.pointerType === 'mouse') { cancelClose(); setOpen(true); } }}
      onPointerLeave={event => { if (!mobile && event.pointerType === 'mouse') timer.current = setTimeout(close, 160); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); close(); trigger.current?.focus(); }
      }}>
      <button ref={trigger} className="product-menu__trigger" type="button" aria-expanded={open} aria-controls={id}
        onClick={() => { cancelClose(); setOpen(value => !value); }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown') {
            event.preventDefault(); setOpen(true);
            requestAnimationFrame(() => ref.current?.querySelector<HTMLAnchorElement>('.product-menu__panel a')?.focus());
          }
        }}>
        {chinese ? traditional ? '產品' : '产品' : 'Product'}<ChevronDown size={13} aria-hidden="true" />
      </button>
      <div className="product-menu__bridge">
        <div id={id} className="product-menu__panel" hidden={!open}
          onClick={event => { if ((event.target as Element).closest('a')) { close(); onNavigate?.(); } }}>
          <div className="product-menu__products">
            <p className="product-menu__heading">{chinese ? traditional ? '產品' : '产品' : 'Product'}</p>
            {PRODUCTS.map(({ slug, name, icon: Icon, description }, index) => (
              <a key={slug} href={`/product/${slug}`}>
                <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                <span><strong>{chinese && index > 0 ? index === 1 ? '自動化'.replace('動', traditional ? '動' : '动') : traditional ? '整合' : '集成' : name}</strong>
                  <small>{chinese ? (traditional ? ['讓每次對話更有價值', '讓工作流程自動運轉', '連接您的知識與工具'] : ['让每次对话更有价值', '让工作流程自动运转', '连接您的知识与工具'])[index] : description}</small></span>
              </a>
            ))}
          </div>
          <div className="product-menu__channels">
            <p className="product-menu__heading">{chinese ? '渠道' : 'Channels'}</p>
            {CHANNELS.map(({ name, icon: Icon }) => (
              <a key={name} href={`${home}#knowledge`}><Icon size={18} strokeWidth={1.6} aria-hidden="true" /><span>{name}</span></a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
