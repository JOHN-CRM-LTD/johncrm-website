import { useEffect, useId, useState } from 'react';
import { ArrowDown, ArrowRight, BookOpen, Check, CodeXml, KeyRound, Mail, MessageSquare, Phone, Play, RotateCcw, ShieldCheck, Workflow } from 'lucide-react';
import johnLogo from '../../assets/johncrm.svg';
import webchatIcon from '../../assets/integrations/webchat.png';
import whatsappIcon from '../../assets/integrations/whatsapp.svg';
import pdfIcon from '../../assets/integrations/pdf.svg';
import excelIcon from '../../assets/integrations/excel.svg';
import powerpointIcon from '../../assets/integrations/powerpoint.svg';
import wordIcon from '../../assets/integrations/word.svg';
import '../../styles/integrations.css';

const DOCUMENTS = [
  { name: 'PDF', detail: 'Policies & product guides', format: 'PDF', icon: pdfIcon },
  { name: 'Excel', detail: 'Catalogues & price lists', format: 'Export as CSV', icon: excelIcon },
  { name: 'PowerPoint', detail: 'Presentations & training', format: 'Export as PDF', icon: powerpointIcon },
  { name: 'Word', detail: 'Handbooks & procedures', format: 'Word documents', icon: wordIcon },
] as const;

const ANSWER_FLOW = [
  ['Ask a question', 'A customer starts a conversation on an enabled channel.'],
  ['Find the right source', 'JOHN finds relevant knowledge or uses a connected API for live information.'],
  ['Put it in context', 'Your business information helps JOHN prepare a useful response.'],
  ['Reply in the conversation', 'The answer returns to the customer on the channel they are already using.'],
] as const;

type Channel = 'Webchat' | 'WhatsApp' | 'WhatsApp Business API' | 'Email' | 'SMS' | 'Voice';

function ChannelIcon({ channel }: { channel: Channel }) {
  if (channel === 'Webchat' || channel.startsWith('WhatsApp')) {
    return <img src={channel === 'Webchat' ? webchatIcon : whatsappIcon} alt="" width="36" height="36" />;
  }
  const Icon = channel === 'Email' ? Mail : channel === 'SMS' ? MessageSquare : Phone;
  return <Icon size={24} strokeWidth={1.5} aria-hidden="true" />;
}

function KnowledgeMap({ channel, onChannelChange, updated }: {
  channel: Channel; onChannelChange: (channel: Channel) => void; updated: boolean;
}) {
  const arrowId = useId();
  const channelNode = (name: Channel, detail: string, className: string) => (
    <button type="button" className={`integration-node ${className}`} aria-pressed={channel === name}
      aria-controls="integration-answer" onClick={() => onChannelChange(name)}>
      <ChannelIcon channel={name} /><strong>{name}</strong><span>{detail}</span>
    </button>
  );
  return <div className="integration-map" role="group" aria-label="Documents feed the Knowledge Base. JOHN uses relevant knowledge and connected APIs to answer customers across enabled channels.">
    <svg className="integration-wires" viewBox="0 0 1000 570" preserveAspectRatio="none" aria-hidden="true">
      <defs><marker id={arrowId} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="m1 1 5 3-5 3" /></marker></defs>
      <g markerStart={`url(#${arrowId})`} markerEnd={`url(#${arrowId})`}>
        <path className={channel === 'Webchat' ? 'is-active' : ''} d="M190 60 C275 60 265 143 350 143" />
        <path className={channel === 'WhatsApp' ? 'is-active' : ''} d="M190 204 C275 204 265 163 350 163" />
        <path className={channel === 'WhatsApp Business API' ? 'is-active' : ''} d="M650 143 C735 143 725 60 810 60" />
        <path d="M650 163 C735 163 725 204 810 204" />
        <path className={['Email', 'SMS', 'Voice'].includes(channel) ? 'is-active' : ''} d="M190 328 C290 328 265 183 350 183" />
      </g>
      <path className="knowledge-feed" d="M500 326 V218" markerEnd={`url(#${arrowId})`} />
      <g markerEnd={`url(#${arrowId})`}>
        <path d="M320 476 V461 Q320 448 337 448 H480 Q500 448 500 431 V419" />
        <path d="M440 476 V448" />
        <path d="M560 476 V448" />
        <path d="M680 476 V461 Q680 448 663 448 H520 Q500 448 500 431 V419" />
      </g>
    </svg>
    <div className="integration-map-channels">
      <span className="integration-map-label">Your conversations</span>
      {channelNode('Webchat', 'Questions from your website', 'integration-node--webchat')}
      {channelNode('WhatsApp', 'Keep the conversation going', 'integration-node--whatsapp')}
      <div className="integration-extra-channels">
        {(['Email', 'SMS', 'Voice'] as const).map(name => <button type="button" key={name} aria-pressed={channel === name} aria-controls="integration-answer" onClick={() => onChannelChange(name)}><ChannelIcon channel={name} /><span>{name}</span></button>)}
      </div>
    </div>
    <div className="integration-map-hub"><img src={johnLogo} alt="JOHN CRM" width="370" height="50" /><span>Your knowledge. Your tools. One helpful answer.</span></div>
    <div className="integration-map-tools">
      <span className="integration-map-label">Your connections</span>
      {channelNode('WhatsApp Business API', 'Connect your business messaging', 'integration-node--business')}
      <div className="integration-node integration-node--api"><CodeXml size={36} strokeWidth={1.35} aria-hidden="true" /><strong>Custom API endpoints</strong><span>Live inventory, orders & business tools</span><small>Request <ArrowRight size={11} /> Look up <ArrowRight size={11} /> Return</small></div>
    </div>
    <div className="integration-retrieval-label">Find relevant knowledge <ArrowDown size={13} aria-hidden="true" /></div>
    <div className="integration-knowledge" data-updated={updated}>
      <div><BookOpen size={23} strokeWidth={1.4} aria-hidden="true" /><strong>Knowledge Base</strong><span><Check size={13} />{updated ? 'Policy updated' : 'Shared business knowledge'}</span></div>
      <p>Read documents <ArrowRight size={13} /> Prepare content <ArrowRight size={13} /> Ready for answers</p>
    </div>
    <div className="integration-documents" aria-label="Knowledge sources and supported import formats">
      {DOCUMENTS.map(document => <div className="integration-document" key={document.name}><img src={document.icon} alt="" width="54" height="70" /><strong>{document.name}</strong><span>{document.detail}</span><small>{document.format}</small></div>)}
    </div>
  </div>;
}

function ConnectionWalkthrough() {
  const [buildStep, setBuildStep] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (buildStep === 3) { setRunning(false); return; }
    const timer = window.setTimeout(() => setBuildStep(value => value + 1), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900);
    return () => window.clearTimeout(timer);
  }, [running, buildStep]);
  return <section className="product-section integration-build product-reveal" aria-labelledby="integration-build-title">
    <h2 id="integration-build-title">The connection starts with a document.</h2>
    <p className="section-lead">Bring your API documentation. JOHN support can help with the rest.</p>
    <div className="integration-steps">
      <article data-complete={buildStep >= 1}>
        <span className="integration-step-number">01 / DOCUMENT</span><h3>Share your API documentation</h3><p>Start with the endpoints, available actions and access requirements for the tool you want to connect.</p>
        <div className="integration-step-visual document-preview"><img src={pdfIcon} width="42" height="54" alt="PDF document" /><strong>Inventory API.pdf</strong><span>Endpoints · actions · authentication</span><span className="build-status"><Check size={15} />{buildStep >= 1 ? 'Documentation read' : 'Ready to explore'}</span></div>
        <ArrowRight className="integration-build-arrow" size={23} strokeWidth={1.3} aria-hidden="true" />
      </article>
      <article data-complete={buildStep >= 2}>
        <span className="integration-step-number">02 / CONNECT</span><h3>Turn endpoints into actions</h3><p>JOHN reads the documentation and prepares the connection, so your AI can work with your business tools.</p>
        <div className="integration-step-visual mapping-preview">{['Read the endpoints', 'Map the available actions', 'Prepare the connection'].map((label, index) => <span key={label}><Workflow size={16} aria-hidden="true" />{label}<Check size={14} aria-hidden="true" className={buildStep >= 2 || (buildStep === 1 && index === 0) ? 'mapping-done' : ''} /></span>)}</div>
        <ArrowRight className="integration-build-arrow" size={23} strokeWidth={1.3} aria-hidden="true" />
      </article>
      <article data-complete={buildStep >= 3}>
        <span className="integration-step-number">03 / ENABLE</span><h3>Add access. Review. Go.</h3><p>Provide the required access, review the setup and choose the channels where JOHN can use your connection.</p>
        <div className="integration-step-visual connected-preview"><KeyRound size={31} strokeWidth={1.35} aria-hidden="true" /><strong>{buildStep >= 3 ? 'Connection ready' : 'Your tools. Your permissions.'}</strong><span>{buildStep >= 3 ? 'Ready for your enabled channels' : 'Access · review · enable'}</span><span className="build-status"><ShieldCheck size={15} />Your business, your control</span></div>
      </article>
    </div>
    <div className="build-demo-action"><button type="button" className="product-button product-button--outline" disabled={running} onClick={() => { setBuildStep(0); setRunning(true); }}>{buildStep === 3 ? <RotateCcw size={16} /> : <Play size={15} />}{running ? 'Connecting the example…' : buildStep === 3 ? 'Replay the connection' : 'Watch the connection come together'}</button><span role="status">{buildStep === 3 ? 'Example complete. Your setup uses your own API documentation.' : 'Illustrative walkthrough. No files are uploaded or accounts connected.'}</span></div>
  </section>;
}

export default function IntegrationDetails() {
  const [updated, setUpdated] = useState(false);
  const [channel, setChannel] = useState<Channel>('Webchat');
  return <>
    <section id="possibilities" className="product-section integration-overview product-reveal" aria-labelledby="integration-overview-title">
      <div className="integration-intro"><h2 id="integration-overview-title">Your knowledge. Put to work.</h2><p>Connect what your business knows with the places your customers talk.<br className="integration-desktop-break" /> Documents supply the knowledge. APIs bring in live information. JOHN connects the conversation.</p></div>
      <KnowledgeMap channel={channel} onChannelChange={setChannel} updated={updated} />
      <p className="integration-map-caption">Select a channel to explore the answer below. Available channels and API actions depend on your workspace setup.</p>
      <ol className="integration-answer-flow" aria-label="How a question becomes an answer">{ANSWER_FLOW.map(([title, detail], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{detail}</p>{index < ANSWER_FLOW.length - 1 && <ArrowRight size={19} strokeWidth={1.3} aria-hidden="true" />}</li>)}</ol>
    </section>
    <section className="product-section product-split integration-update product-reveal" aria-labelledby="integration-update-title">
      <div className="product-section-copy"><h2 id="integration-update-title">Update once.<br />Answer everywhere.</h2><p>Keep policies, product information and guides in one shared knowledge base. Once an updated source is processed, JOHN can use it across your enabled channels.</p><p>Try changing the return window from 30 to 60 days, then switch channels to see the same policy in each answer.</p><button type="button" className="product-text-link" aria-controls="integration-answer" onClick={() => setUpdated(value => !value)}>{updated ? 'Reset the example' : 'Preview a knowledge update'}{updated ? <RotateCcw size={16} /> : <ArrowRight size={17} />}</button></div>
      <div className="integration-answer-demo">
        <div className="integration-answer-channels" role="group" aria-label="Preview an answer by channel">{(['Webchat', 'WhatsApp', 'WhatsApp Business API', 'Email', 'SMS', 'Voice'] as const).map(name => <button type="button" key={name} aria-pressed={channel === name} aria-controls="integration-answer" onClick={() => setChannel(name)}><ChannelIcon channel={name} /><span>{name === 'WhatsApp Business API' ? 'Business API' : name}</span></button>)}</div>
        <div className="integration-policy"><img src={pdfIcon} alt="" width="27" height="35" /><div><strong>Returns policy.pdf</strong><span>{updated ? 'Updated source · 60-day returns' : 'Original source · 30-day returns'}</span></div><span className="integration-policy-state"><Check size={13} />{updated ? 'Updated' : 'Ready'}</span></div>
        <div id="integration-answer" className="integration-answer" aria-live="polite" aria-atomic="true"><span><ChannelIcon channel={channel} />{channel} answer</span><p>“You can return an unworn item within <strong>{updated ? '60' : '30'} days.</strong>”</p><small><BookOpen size={13} aria-hidden="true" />Source: Returns policy · Knowledge Base</small></div>
        <p className="integration-example-note">Illustrative preview. No live messages are sent.</p>
      </div>
    </section>
    <ConnectionWalkthrough />
  </>;
}
