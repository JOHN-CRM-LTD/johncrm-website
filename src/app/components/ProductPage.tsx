import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, Bot, CalendarDays, Check, CircleHelp, FileText, Gift, Globe, MessageCircle, Package, Play, Plug, RotateCcw, ShieldCheck, Sparkles, Store, Upload, Workflow, Zap } from 'lucide-react';
import { CHANNELS, PRODUCTS, type ProductSlug } from './ProductMenu';
import aiImage from '../../assets/products/john-ai.webp';
import automationsImage from '../../assets/products/automations.webp';
import integrationsImage from '../../assets/products/integrations.webp';
import sweatshirtImage from '../../assets/product-demo/red-sweatshirt.jpg';
import '../../styles/product-pages.css';

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
  const [answered, setAnswered] = useState(false);
  if (product === 'john-ai') return (
    <div className="hero-preview hero-preview--ai">
      <div className="preview-identity"><JohnMark /><span>JOHN AI<small>Always on. Naturally yours.</small></span></div>
      <p aria-live="polite">{answered ? 'Yes — red is available in S, M and L. Which store works for you?' : 'How can I help today?'}</p>
      <button className="preview-question" onClick={() => setAnswered(value => !value)}>
        <span>{answered ? 'Try the example again' : 'Do you have this in red?'}</span>{answered ? <RotateCcw size={16} /> : <ArrowRight size={17} />}
      </button>
      <small className="preview-caption">Illustrative conversation</small>
    </div>
  );
  if (product === 'automations') return (
    <div className="hero-preview hero-preview--workflow">
      <div className="preview-identity"><Workflow size={19} /><span>Enquiry to visit</span></div>
      <ol className="mini-workflow">
        {['Enquiry received', 'Check availability', 'Notify store manager', 'Confirm the visit'].map((text, index) => <li key={text} style={{ '--step': index } as React.CSSProperties}><span /><div>{text}<small>{['A customer starts a conversation', 'Find the right size and store', 'Send the reservation request', 'Keep the customer in the loop'][index]}</small></div></li>)}
      </ol>
      <a href="#possibilities" className="preview-bottom-link">Follow the journey<ArrowDown size={15} /></a>
    </div>
  );
  return (
    <div className="hero-preview hero-preview--sources">
      <div className="preview-identity"><span>Connect your world</span><Plug size={18} /></div>
      {[[FileText, 'Your documents', 'Policies, guides and product details'], [Plug, 'Your APIs', 'Inventory, orders and business tools'], [Bot, 'One shared knowledge base', 'Ready for your connected channels']].map(([Icon, title, detail]) => {
        const SourceIcon = Icon as typeof FileText;
        return <div className="source-row" key={String(title)}><SourceIcon size={19} /><span>{String(title)}<small>{String(detail)}</small></span><Check size={14} /></div>;
      })}
      <a href="#possibilities" className="preview-bottom-link">See how it connects<ArrowDown size={15} /></a>
    </div>
  );
}

const AI_EXAMPLES = [
  { label: 'Website chat', icon: Globe, question: 'Can I return something bought online?', answer: 'Of course. You can return an unworn item within 30 days. Bring your order confirmation and I can help you find your nearest store.', source: 'Returns policy · Knowledge Base' },
  { label: 'Live inventory', icon: Package, question: 'Do you have the red sweatshirt in medium?', answer: 'Yes — medium is in stock at our Central store. Would you like me to help arrange a visit?', source: 'Connected inventory · Central store' },
  { label: 'WhatsApp retention', icon: MessageCircle, question: 'I loved the sweatshirt. Do you have anything to go with it?', answer: 'Glad you loved it! Our new everyday trousers would be a lovely match. Would you like me to check your size?', source: 'Product catalogue · Knowledge Base' },
] as const;

function AiDetails() {
  const [selected, setSelected] = useState(1);
  const example = AI_EXAMPLES[selected];
  return <>
    <section id="possibilities" className="product-section product-reveal">
      <h2>From the first hello to the next visit.</h2>
      <div className="product-capabilities">
        {AI_EXAMPLES.map(({ label, icon: Icon }, index) => <article key={label}><Icon size={30} strokeWidth={1.35} /><div><h3>{label}</h3><p>{[
          'Give your website a helpful AI chatbot. Answer questions, guide browsing, and turn interest into a conversation.',
          'Look up products, sizes and store availability through your connected inventory. Give customers a useful next step.',
          'Keep the relationship going after a purchase. Reply with relevant recommendations and helpful follow-ups on WhatsApp.',
        ][index]}</p></div></article>)}
      </div>
    </section>
    <section className="product-section product-split product-reveal">
      <div className="product-section-copy"><h2>Knows your business.<br />Speaks your language.</h2><p>Your products. Your policies. Your tone of voice. JOHN AI uses your shared knowledge to help customers on your website and across connected channels.</p><p>Let AI handle everyday questions, with your team ready to take over when a conversation needs a human touch.</p><TextLink href="/product/integrations">See what JOHN can know</TextLink></div>
      <div className="conversation-demo">
        <div className="demo-tabs" role="tablist" aria-label="Example conversation">
          {AI_EXAMPLES.map(({ label }, index) => <button key={label} role="tab" id={`ai-tab-${index}`} aria-controls="ai-conversation" aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (selected + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
              setSelected(next); document.getElementById(`ai-tab-${next}`)?.focus();
            }
          }}>{label}</button>)}
        </div>
        <div className="conversation-header"><JohnMark /><span>JOHN AI<small>{example.label}</small></span><span className="demo-label">Example</span></div>
        <div id="ai-conversation" role="tabpanel" aria-labelledby={`ai-tab-${selected}`} tabIndex={0} className="conversation-body" aria-live="polite">
          <div key={selected} className="conversation-turn"><p className="message-customer">{example.question}</p><div className="message-john"><p>{example.answer}</p>{selected === 1 && <div className="stock-result"><img src={sweatshirtImage} alt="Red sweatshirt" loading="lazy" width="64" height="76" /><span>Classic Sweatshirt<small>Red / Medium / Central</small><strong><Check size={13} /> In stock</strong></span></div>}<small className="message-source"><ShieldCheck size={13} />{example.source}</small></div></div>
        </div>
        <p className="demo-footnote">Explore an example above. Your answers use your connected sources.</p>
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
  const [step, setStep] = useState(0);
  return <>
    <section id="possibilities" className="product-section product-reveal">
      <div className="section-introduction"><h2>One enquiry.<br />A beautifully connected journey.</h2><p>From online interest to an in-store visit. Here’s how a retail reservation can flow with JOHN.</p></div>
      <div className="retail-journey" aria-label="Retail automation example">
        {RETAIL_STEPS.map(({ icon: Icon, title, description }, index) => <button key={title} className="journey-step" aria-pressed={step === index} aria-controls="journey-detail" onClick={() => setStep(index)}><span className="journey-icon"><Icon size={25} strokeWidth={1.5} /></span><span className="journey-number">0{index + 1}</span><strong>{title}</strong><span>{description}</span>{index < 3 && <ArrowRight className="journey-arrow" size={27} strokeWidth={1} aria-hidden="true" />}</button>)}
      </div>
      <div id="journey-detail" className="journey-detail" aria-live="polite"><span>0{step + 1} / 04</span><p key={step}>{RETAIL_STEPS[step].detail}</p></div>
    </section>
    <section className="product-section product-split product-reveal">
      <div className="product-section-copy"><h2>Make the next visit<br />feel personal.</h2><p>Remember the moments that matter. Send a personalised birthday greeting at the right time, without another reminder on your calendar.</p><p>Connect coupon campaigns to your customer journey. Deliver a hosted coupon link on WhatsApp, with offer details, expiry dates and delivery history in one place.</p><TextLink href="/#contact">Explore more ways to automate</TextLink></div>
      <div className="birthday-scene" aria-label="Example birthday greeting and coupon">
        <div className="birthday-note"><Gift size={27} strokeWidth={1} /><span>For the moments<br />that matter.</span><hr /><h3>Happy<br />Birthday,<br /><em>Jamie.</em></h3><p>A little something to make<br />your next visit even better.</p><span className="birthday-signature">With love, your favourite store</span></div>
        <div className="birthday-coupon"><span>A GIFT FOR YOUR NEXT VISIT</span><strong>20% <em>off</em></strong><span>Something you’ll love.</span><div className="coupon-dashes" /><small>YOUR BIRTHDAY TREAT</small><Gift size={20} strokeWidth={1} /></div>
        <small className="birthday-caption">Illustrative greeting and offer</small>
      </div>
    </section>
    <section className="product-support product-reveal"><CircleHelp size={25} strokeWidth={1.4} /><h3>Your workflow is unique.<br />Your modules can be, too.</h3><p>Tell JOHN support how your business works. Our team can build custom modules and connect the steps, triggers and actions around your workflow.</p><TextLink href="/#contact">Build with JOHN</TextLink></section>
  </>;
}

function IntegrationDetails() {
  const [buildStep, setBuildStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [channel, setChannel] = useState('Webchat');
  useEffect(() => {
    if (!running) return;
    if (buildStep === 3) { setRunning(false); return; }
    const timer = setTimeout(() => setBuildStep(value => value + 1), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 750);
    return () => clearTimeout(timer);
  }, [running, buildStep]);
  return <>
    <section id="possibilities" className="product-section integration-build product-reveal">
      <h2>The connection starts with a document.</h2><p className="section-lead">No engineer required. JOHN support is here for setup.</p>
      <div className="integration-steps">
        <article data-complete={buildStep >= 1}><span className="integration-step-number">01</span><h3>Upload API documentation</h3><p>Give JOHN the endpoint documentation for the tool you want to connect. Start with the information you already have.</p><div className="integration-step-visual document-preview"><FileText size={30} strokeWidth={1.3} /><strong>Inventory API.pdf</strong><span>Endpoint documentation</span><span className="build-status">{buildStep >= 1 ? <><Check size={15} /> Documentation read</> : <><Upload size={15} /> Ready to explore</>}</span></div></article>
        <article data-complete={buildStep >= 2}><span className="integration-step-number">02</span><h3>JOHN builds the connection</h3><p>JOHN reads the documentation and builds the integration, turning your API into something your AI can work with.</p><div className="integration-step-visual mapping-preview">{['Read the endpoints', 'Map the available actions', 'Prepare the connection'].map((label, index) => <span key={label}><Workflow size={16} />{label}<Check size={14} className={buildStep >= 2 || (buildStep === 1 && index === 0) ? 'mapping-done' : ''} /></span>)}</div></article>
        <article data-complete={buildStep >= 3}><span className="integration-step-number">03</span><h3>Add access and go</h3><p>Provide any required access, review the setup, and choose where JOHN can use it. Need a hand? Our support team can help.</p><div className="integration-step-visual connected-preview"><Plug size={30} strokeWidth={1.3} /><strong>{buildStep >= 3 ? 'Connection ready' : 'Your tools. Now connected.'}</strong><span>{buildStep >= 3 ? 'Ready for your enabled channels' : 'You choose the access and permissions'}</span><span className="build-status"><ShieldCheck size={15} /> Your business, your control</span></div></article>
      </div>
      <div className="build-demo-action"><button className="product-button product-button--outline" disabled={running} onClick={() => { setBuildStep(0); setRunning(true); }}>{buildStep === 3 ? <RotateCcw size={16} /> : <Play size={15} />}{running ? 'Connecting the example…' : buildStep === 3 ? 'Replay the connection' : 'Watch the connection come together'}</button><span role="status">{buildStep === 3 ? 'Example complete. Your setup uses your own API documentation.' : 'An illustrative walkthrough. No files or accounts needed.'}</span></div>
    </section>
    <section className="product-section product-split product-reveal">
      <div className="product-section-copy"><h2>Update once.<br />Answer everywhere.</h2><p>Upload your own documents, product information and policies to one shared knowledge base. When you update a source, JOHN can use the latest processed content across your enabled channels.</p><p>From Webchat and WhatsApp to email, SMS and voice, keep answers connected to the same business knowledge.</p><button className="product-text-link" onClick={() => setUpdated(value => !value)}>{updated ? 'Reset the example' : 'Preview a knowledge update'}{updated ? <RotateCcw size={16} /> : <ArrowRight size={17} />}</button></div>
      <div className="knowledge-demo">
        <div className="knowledge-diagram"><div className="knowledge-inputs"><span><FileText size={19} />Your documents</span><span><Package size={19} />Product catalogue</span><span><Plug size={19} />Connected APIs</span></div><div className="knowledge-hub"><Sparkles size={25} strokeWidth={1.2} /><strong>JOHN</strong><span>Knowledge</span></div><div className="knowledge-outputs">{CHANNELS.map(({ name, icon: Icon }) => <button key={name} aria-pressed={channel === name} onClick={() => setChannel(name)}><Icon size={16} /><span>{name}</span><Check size={12} /></button>)}</div></div>
        <div className="knowledge-answer" aria-live="polite"><span><FileText size={14} /> Returns policy {updated ? '· updated' : '· original'}</span><p key={`${channel}-${updated}`}><strong>{channel} answer</strong>“You can return an unworn item within {updated ? '60' : '30'} days.”</p><small>{updated ? 'New policy reflected across all five example channels.' : 'Select a channel, then preview a policy update.'}</small></div>
      </div>
    </section>
  </>;
}

export default function ProductPage({ product }: { product: ProductSlug }) {
  const ref = useRef<HTMLElement>(null);
  const content = CONTENT[product];
  useEffect(() => {
    const name = PRODUCTS.find(item => item.slug === product)!.name;
    const previousTitle = document.title;
    document.title = `${name} · JOHN CRM`;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    ref.current?.querySelectorAll('.product-reveal').forEach(element => observer.observe(element));
    return () => { observer.disconnect(); document.title = previousTitle; };
  }, [product]);
  return <main className={`product-page product-page--${product}`} ref={ref} lang="en">
    <section className="product-hero">
      <div className="product-hero-copy"><h1>{content.title.map(line => <span key={line}>{line}</span>)}</h1><p>{content.description}</p><div className="product-hero-actions"><a className="product-button" href="/#contact">See JOHN in action<ArrowRight size={18} /></a><TextLink href="#possibilities">Explore the possibilities</TextLink></div></div>
      <div className="product-hero-art"><img className="product-cinema" src={content.image} alt={content.alt} width="1376" height="1152" loading="eager" /><HeroPreview product={product} /></div>
    </section>
    {product === 'john-ai' ? <AiDetails /> : product === 'automations' ? <AutomationDetails /> : <IntegrationDetails />}
  </main>;
}
