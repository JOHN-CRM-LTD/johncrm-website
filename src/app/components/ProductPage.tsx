import { usePageTranslation } from '../translations/language';
import { PRODUCT_COPY } from '../translations/product';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, Bot, CalendarDays, Check, CircleHelp, FileText, Gift, Globe, MessageCircle, Package, Plug, RotateCcw, ShieldCheck, Sparkles, Store, Workflow } from 'lucide-react';
import { PRODUCTS, type ProductSlug } from './ProductMenu';
import aiImage from '../../assets/products/john-ai.webp';
import automationsImage from '../../assets/products/automations.webp';
import integrationsImage from '../../assets/products/integrations.webp';
import sweatshirtImage from '../../assets/product-demo/red-sweatshirt.jpg';
import '../../styles/product-pages.css';
import IntegrationDetails from './IntegrationDetails';
import pdfIcon from '../../assets/integrations/pdf.svg';

const CONTENT = {
  'john-ai': {
    title: ['Every conversation.', 'A little more human.'],
    description: 'Turn website questions into confident answers. Check stock, help customers plan a store visit, and keep the conversation going on WhatsApp.',
    image: aiImage, alt: 'A brushed silver loop in a sunlit travertine gallery',
  },
  automations: {
    title: ['Less busywork.', 'More business.'],
    description: 'Your best workflows, on repeat. From a first enquiry to a birthday surprise, JOHN keeps the thoughtful details moving.',
    image: automationsImage, alt: 'Sunlit stone arches flowing towards an open mountain landscape',
  },
  integrations: {
    title: ['Your knowledge.', 'Everywhere it matters.'],
    description: 'Bring your documents and tools together. JOHN turns what your business knows into answers your customers can use.',
    image: integrationsImage, alt: 'Glass and silver ribbons meeting in a warm stone interior',
  },
} as const;

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="product-text-link" href={href}>{children}<ArrowRight size={17} aria-hidden="true" /></a>;
}

function JohnMark() {
  return <span className="john-mark"><Sparkles size={19} strokeWidth={1.5} aria-hidden="true" /></span>;
}

function HeroPreview({ product }: { product: ProductSlug }) {
  const { t } = usePageTranslation(PRODUCT_COPY);
  const [answered, setAnswered] = useState(false);
  if (product === 'john-ai') return (
    <div className="hero-preview hero-preview--ai">
      <div className="preview-identity"><JohnMark /><span>JOHN AI<small>{t("Always on. Naturally yours.")}</small></span></div>
      <p aria-live="polite">{t(answered ? 'Yes — red is available in S, M and L. Which store works for you?' : 'How can I help today?')}</p>
      <button className="preview-question" onClick={() => setAnswered(value => !value)}>
        <span>{t(answered ? 'Try the example again' : 'Do you have this in red?')}</span>{answered ? <RotateCcw size={16} /> : <ArrowRight size={17} />}
      </button>
      <small className="preview-caption">{t("Illustrative conversation")}</small>
    </div>
  );
  if (product === 'automations') return (
    <div className="hero-preview hero-preview--workflow">
      <div className="preview-identity"><Workflow size={19} /><span>{t("Enquiry to visit")}</span></div>
      <ol className="mini-workflow">
        {['Enquiry received', 'Check availability', 'Notify store manager', 'Confirm the visit'].map((text, index) => <li key={text} style={{ '--step': index } as React.CSSProperties}><span /><div>{t(text)}<small>{t(['A customer starts a conversation', 'Find the right size and store', 'Send the reservation request', 'Keep the customer in the loop'][index])}</small></div></li>)}
      </ol>
      <a href="#possibilities" className="preview-bottom-link">{t("Follow the journey")}<ArrowDown size={15} /></a>
    </div>
  );
  return (
    <div className="hero-preview hero-preview--sources">
      <div className="preview-identity"><span>{t("Connect your world")}</span><Plug size={18} /></div>
      {[[FileText, 'Your documents', 'Policies, guides and product details'], [Plug, 'Your APIs', 'Inventory, orders and business tools'], [Bot, 'One shared knowledge base', 'Ready for your connected channels']].map(([Icon, title, detail]) => {
        const SourceIcon = Icon as typeof FileText;
        return <div className="source-row" key={t(String(title))}>{title === 'Your documents' ? <img src={pdfIcon} width="20" height="26" alt="" /> : <SourceIcon size={19} />}<span>{t(String(title))}<small>{t(String(detail))}</small></span><Check size={14} /></div>;
      })}
      <a href="#possibilities" className="preview-bottom-link">{t("See how it connects")}<ArrowDown size={15} /></a>
    </div>
  );
}

const AI_EXAMPLES = [
  { label: 'Website chat', icon: Globe, question: 'Can I return something bought online?', answer: 'Of course. You can return an unworn item within 30 days. Bring your order confirmation and I can help you find your nearest store.', source: 'Returns policy · Knowledge Base' },
  { label: 'Live inventory', icon: Package, question: 'Do you have the red sweatshirt in medium?', answer: 'Yes — medium is in stock at our Central store. Would you like me to help arrange a visit?', source: 'Connected inventory · Central store' },
  { label: 'WhatsApp retention', icon: MessageCircle, question: 'I loved the sweatshirt. Do you have anything to go with it?', answer: 'Glad you loved it! Our new everyday trousers would be a lovely match. Would you like me to check your size?', source: 'Product catalogue · Knowledge Base' },
] as const;

function AiDetails() {
  const { t } = usePageTranslation(PRODUCT_COPY);
  const [selected, setSelected] = useState(1);
  const example = AI_EXAMPLES[selected];
  return <>
    <section id="possibilities" className="product-section product-reveal">
      <h2>{t("From the first hello to the next visit.")}</h2>
      <div className="product-capabilities">
        {AI_EXAMPLES.map(({ label, icon: Icon }, index) => <article key={label}><Icon size={30} strokeWidth={1.35} /><div><h3>{t(label)}</h3><p>{t([
          'Give your website a helpful AI chatbot. Answer questions, guide browsing, and turn interest into a conversation.',
          'Look up products, sizes and store availability through your connected inventory. Give customers a useful next step.',
          'Keep the relationship going after a purchase. Reply with relevant recommendations and helpful follow-ups on WhatsApp.',
        ][index])}</p></div></article>)}
      </div>
    </section>
    <section className="product-section product-split product-reveal">
      <div className="product-section-copy"><h2>{t("Knows your business.")}<br />{t("Speaks your language.")}</h2><p>{t("Your products. Your policies. Your tone of voice. JOHN AI uses your shared knowledge to help customers on your website and across connected channels.")}</p><p>{t("Let AI handle everyday questions, with your team ready to take over when a conversation needs a human touch.")}</p><TextLink href="/product/integrations">{t("See what JOHN can know")}</TextLink></div>
      <div className="conversation-demo">
        <div className="demo-tabs" role="tablist" aria-label={t("Example conversation")}>
          {AI_EXAMPLES.map(({ label }, index) => <button key={label} role="tab" id={`ai-tab-${index}`} aria-controls="ai-conversation" aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (selected + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
              setSelected(next); document.getElementById(`ai-tab-${next}`)?.focus();
            }
          }}>{t(label)}</button>)}
        </div>
        <div className="conversation-header"><JohnMark /><span>JOHN AI<small>{t(example.label)}</small></span><span className="demo-label">{t("Example")}</span></div>
        <div id="ai-conversation" role="tabpanel" aria-labelledby={`ai-tab-${selected}`} tabIndex={0} className="conversation-body" aria-live="polite">
          <div key={selected} className="conversation-turn"><p className="message-customer">{t(example.question)}</p><div className="message-john"><p>{t(example.answer)}</p>{selected === 1 && <div className="stock-result"><img src={sweatshirtImage} alt={t("Red sweatshirt")} loading="lazy" width="64" height="76" /><span>{t("Classic Sweatshirt")}<small>{t("Red / Medium / Central")}</small><strong><Check size={13} />{' '}{t("In stock")}</strong></span></div>}<small className="message-source"><ShieldCheck size={13} />{t(example.source)}</small></div></div>
        </div>
        <p className="demo-footnote">{t("Explore an example above. Your answers use your connected sources.")}</p>
      </div>
    </section>
  </>;
}

const RETAIL_STEPS = [
  { icon: MessageCircle, title: 'Customer asks', description: '“Could I try the red sweatshirt in medium this afternoon?”', detail: 'A customer messages your website or WhatsApp. JOHN understands the product, size and preferred visit time.' },
  { icon: Package, title: 'JOHN checks stock', description: 'The right product. The right size. The right store.', detail: 'JOHN looks up the item in your connected inventory and helps the customer choose an available store.' },
  { icon: Store, title: 'Manager confirms', description: 'A reservation request, straight to the store manager.', detail: 'A WhatsApp alert gives the manager the item, size, pickup time and reservation reference. They can accept or decline.' },
  { icon: CalendarDays, title: 'Customer visits', description: 'A confirmed plan, with the team ready to help.', detail: 'Once the manager accepts, the customer gets confirmation. Your team can track whether the reservation is fulfilled or released.' },
] as const;

function AutomationDetails() {
  const { t } = usePageTranslation(PRODUCT_COPY);
  const [step, setStep] = useState(0);
  return <>
    <section id="possibilities" className="product-section product-reveal">
      <div className="section-introduction"><h2>{t("One enquiry.")}<br />{t("A beautifully connected journey.")}</h2><p>{t("From online interest to an in-store visit. Here’s how a retail reservation can flow with JOHN.")}</p></div>
      <div className="retail-journey" aria-label={t("Retail automation example")}>
        {RETAIL_STEPS.map(({ icon: Icon, title, description }, index) => <button key={title} className="journey-step" aria-pressed={step === index} aria-controls="journey-detail" onClick={() => setStep(index)}><span className="journey-icon"><Icon size={25} strokeWidth={1.5} /></span><span className="journey-number">0{index + 1}</span><strong>{t(title)}</strong><span>{t(description)}</span>{index < 3 && <ArrowRight className="journey-arrow" size={27} strokeWidth={1} aria-hidden="true" />}</button>)}
      </div>
      <div id="journey-detail" className="journey-detail" aria-live="polite"><span>0{step + 1} / 04</span><p key={step}>{t(RETAIL_STEPS[step].detail)}</p></div>
    </section>
    <section className="product-section product-split product-reveal">
      <div className="product-section-copy"><h2>{t("Make the next visit")}<br />{t("feel personal.")}</h2><p>{t("Remember the moments that matter. Send a personalised birthday greeting at the right time, without another reminder on your calendar.")}</p><p>{t("Connect coupon campaigns to your customer journey. Deliver a hosted coupon link on WhatsApp, with offer details, expiry dates and delivery history in one place.")}</p><TextLink href="/#contact">{t("Explore more ways to automate")}</TextLink></div>
      <div className="birthday-scene" aria-label={t("Example birthday greeting and coupon")}>
        <div className="birthday-note"><Gift size={27} strokeWidth={1} /><span>{t("For the moments")}<br />{t("that matter.")}</span><hr /><h3>{t("Happy")}<br />{t("Birthday,")}<br /><em>{t("Jamie.")}</em></h3><p>{t("A little something to make")}<br />{t("your next visit even better.")}</p><span className="birthday-signature">{t("With love, your favourite store")}</span></div>
        <div className="birthday-coupon"><span>{t("A GIFT FOR YOUR NEXT VISIT")}</span><strong>20% <em>{t("off")}</em></strong><span>{t("Something you’ll love.")}</span><div className="coupon-dashes" /><small>{t("YOUR BIRTHDAY TREAT")}</small><Gift size={20} strokeWidth={1} /></div>
        <small className="birthday-caption">{t("Illustrative greeting and offer")}</small>
      </div>
    </section>
    <section className="product-support product-reveal"><CircleHelp size={25} strokeWidth={1.4} /><h3>{t("Your workflow is unique.")}<br />{t("Your modules can be, too.")}</h3><p>{t("Tell JOHN support how your business works. Our team can build custom modules and connect the steps, triggers and actions around your workflow.")}</p><TextLink href="/#contact">{t("Build with JOHN")}</TextLink></section>
  </>;
}

export default function ProductPage({ product }: { product: ProductSlug }) {
  const { t, lang } = usePageTranslation(PRODUCT_COPY);
  const ref = useRef<HTMLElement>(null);
  const content = CONTENT[product];
  useEffect(() => {
    const name = PRODUCTS.find(item => item.slug === product)!.name;
    const previousTitle = document.title;
    document.title = `${t(name)} · JOHN CRM`;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    ref.current?.querySelectorAll('.product-reveal').forEach(element => observer.observe(element));
    return () => { observer.disconnect(); document.title = previousTitle; };
  }, [product, t]);
  return <main className={`product-page product-page--${product}`} ref={ref} lang={lang}>
    <section className="product-hero">
      <div className="product-hero-copy"><h1>{content.title.map(line => <span key={line}>{t(line)}</span>)}</h1><p>{t(content.description)}</p><div className="product-hero-actions"><a className="product-button" href="/#contact">{t("See JOHN in action")}<ArrowRight size={18} /></a><TextLink href="#possibilities">{t("Explore the possibilities")}</TextLink></div></div>
      <div className="product-hero-art"><img className="product-cinema" src={content.image} alt={t(content.alt)} width="1376" height="1152" loading="eager" /><HeroPreview product={product} /></div>
    </section>
    {product === 'john-ai' ? <AiDetails /> : product === 'automations' ? <AutomationDetails /> : <IntegrationDetails />}
  </main>;
}
