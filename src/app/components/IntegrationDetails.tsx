import { useState, type CSSProperties } from 'react';
import { ArrowRight, BookOpen, Check, CodeXml, KeyRound, Mail, MessageSquare, Phone, RotateCcw, Workflow } from 'lucide-react';
import johnLogo from '../../assets/johncrm.svg';
import webchatIcon from '../../assets/integrations/webchat.png';
import whatsappIcon from '../../assets/integrations/whatsapp.svg';
import pdfIcon from '../../assets/integrations/pdf.svg';
import excelIcon from '../../assets/integrations/excel.svg';
import powerpointIcon from '../../assets/integrations/powerpoint.svg';
import wordIcon from '../../assets/integrations/word.svg';
import '../../styles/integrations.css';

const DOCUMENTS = [
  { name: 'PDF', format: '', icon: pdfIcon },
  { name: 'Excel', format: 'CSV export', icon: excelIcon },
  { name: 'PowerPoint', format: 'PDF export', icon: powerpointIcon },
  { name: 'Word', format: '', icon: wordIcon },
] as const;

type Channel = 'Webchat' | 'WhatsApp' | 'WhatsApp Business API' | 'Email' | 'SMS' | 'Voice';
type Connection = Channel | 'Custom APIs';

type WirePoint = readonly [number, number];

// Use the homepage's midpoint curves.
function makeWire(start: WirePoint, end: WirePoint, vertical = false) {
  const [sx, sy] = start;
  const [ex, ey] = end;
  const mid = vertical ? (sy + ey) / 2 : (sx + ex) / 2;
  return vertical ? `M${sx} ${sy} C${sx} ${mid} ${ex} ${mid} ${ex} ${ey}` : `M${sx} ${sy} C${mid} ${sy} ${mid} ${ey} ${ex} ${ey}`;
}

const CONNECTION_WIRES: Record<Connection, string> = {
  Webchat: makeWire([322, 147], [207, 60]),
  WhatsApp: makeWire([322, 163], [207, 204]),
  'WhatsApp Business API': makeWire([678, 147], [793, 60]),
  Email: makeWire([445, 118], [400, 76], true),
  SMS: makeWire([500, 118], [500, 76], true),
  Voice: makeWire([555, 118], [600, 76], true),
  'Custom APIs': makeWire([793, 204], [678, 163]),
};
const SOURCE_PATHS = [
  'M500 295 V195',
  'M320 420 V402 Q320 390 337 390 H480 Q500 390 500 373 V359',
  'M440 420 V390',
  'M560 420 V390',
  'M680 420 V402 Q680 390 663 390 H520 Q500 390 500 373 V359',
];

function ChannelIcon({ channel, animated = false }: { channel: Connection; animated?: boolean }) {
  const className = animated ? 'integration-icon-feedback' : undefined;
  if (channel === 'Webchat' || channel.startsWith('WhatsApp')) {
    return <img className={className} src={channel === 'Webchat' ? webchatIcon : whatsappIcon} alt="" width="36" height="36" />;
  }
  if (channel === 'Custom APIs') return <CodeXml className={className} size={36} strokeWidth={1.35} aria-hidden="true" />;
  const Icon = channel === 'Email' ? Mail : channel === 'SMS' ? MessageSquare : Phone;
  return <Icon className={className} size={23} strokeWidth={1.5} aria-hidden="true" />;
}

function KnowledgeMap({ channel, onChannelChange, updated }: {
  channel: Channel; onChannelChange: (channel: Channel) => void; updated: boolean;
}) {
  const [motion, setMotion] = useState<{ connection: Connection; sequence: number }>({ connection: channel, sequence: 0 });
  const playConnection = (connection: Connection) => {
    setMotion(previous => ({ connection, sequence: previous.sequence + 1 }));
    if (connection !== 'Custom APIs') onChannelChange(connection);
  };
  const connectionIcon = (name: Connection) => {
    const animated = motion.connection === name && motion.sequence > 0;
    return <ChannelIcon key={animated ? motion.sequence : 0} channel={name} animated={animated} />;
  };
  const channelNode = (name: Connection, className: string) => (
    <button type="button" className={`integration-node ${className}`} aria-pressed={name === 'Custom APIs' ? undefined : channel === name}
      aria-controls={name === 'Custom APIs' ? undefined : 'integration-answer'} onClick={() => playConnection(name)}>
      {connectionIcon(name)}<strong>{name}</strong>
    </button>
  );
  return <div className="integration-map" role="group" aria-label="Documents feed the Knowledge Base. JOHN uses this knowledge and connected APIs to answer on your selected channel.">
    <svg className="integration-wires" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
      <g className="integration-wire-tracks">
        {Object.values(CONNECTION_WIRES).map(path => <g key={path}>
          <path className="integration-wire-ghost" d={path} />
          <path className="integration-wire-live" pathLength="1" d={path} />
        </g>)}
        {SOURCE_PATHS.map(path => <g key={path}><path className="integration-wire-ghost" d={path} /><path className="integration-wire-live" pathLength="1" d={path} /></g>)}
      </g>
      <g key={`${motion.sequence}-${updated}`} className="integration-signals" data-connection={motion.connection} data-replay={motion.sequence}>
        {motion.connection !== 'Custom APIs' && <path className="integration-signal integration-signal--source" pathLength="100" d="M500 295 V195" />}
        <path className="integration-signal" pathLength="100" d={CONNECTION_WIRES[motion.connection]} />
      </g>
    </svg>
    <div className="integration-documents" aria-label="Knowledge sources and import formats">
      {DOCUMENTS.map((document, index) => <div className="integration-document" key={document.name} style={{ '--document-delay': `${index * 70}ms` } as CSSProperties}><img src={document.icon} alt="" width="54" height="70" /><strong>{document.name}</strong>{document.format && <small>{document.format}</small>}</div>)}
    </div>
    <div className="integration-knowledge" data-updated={updated}><BookOpen size={22} strokeWidth={1.4} aria-hidden="true" /><strong>Knowledge Base</strong><Check size={15} aria-hidden="true" /></div>
    <div className="integration-extra-channels" role="group" aria-label="More channels">{(['Email', 'SMS', 'Voice'] as const).map(name => <button type="button" key={name} aria-pressed={channel === name} aria-controls="integration-answer" onClick={() => playConnection(name)}>{connectionIcon(name)}<span>{name}</span></button>)}</div>
    <div className="integration-map-hub"><img src={johnLogo} alt="JOHN CRM" width="370" height="50" /></div>
    <div className="integration-map-destinations" role="group" aria-label="Explore channels and connected APIs">
      {channelNode('Webchat', 'integration-node--webchat')}
      {channelNode('WhatsApp Business API', 'integration-node--business')}
      {channelNode('WhatsApp', 'integration-node--whatsapp')}
      {channelNode('Custom APIs', 'integration-node--api')}
    </div>
  </div>;
}

const CONNECTION_STEPS = [
  { title: 'Share your API docs', detail: 'Start with your documentation.', icon: 'document' },
  { title: 'JOHN connects the dots', detail: 'Turn endpoints into actions.', icon: 'workflow' },
  { title: 'Review & enable', detail: 'You control access.', icon: 'key' },
] as const;

function ConnectionWalkthrough() {
  return <section className="product-section integration-setup product-reveal" aria-labelledby="integration-build-title">
    <div className="integration-intro"><h2 id="integration-build-title">Your tools. Connected.</h2><p>From API documentation to a working connection.</p></div>
    <ol className="integration-setup-flow" aria-label="API connection walkthrough">
      {CONNECTION_STEPS.map(({ title, detail, icon }, index) => <li key={title}>
        <div className="integration-setup-icon">{icon === 'document' ? <img src={pdfIcon} width="35" height="46" alt="" /> : icon === 'workflow' ? <Workflow size={31} strokeWidth={1.3} aria-hidden="true" /> : <KeyRound size={31} strokeWidth={1.3} aria-hidden="true" />}</div>
        <span className="integration-setup-number">0{index + 1}</span><h3>{title}</h3><p>{detail}</p>
      </li>)}
    </ol>
  </section>;
}

export default function IntegrationDetails() {
  const [updated, setUpdated] = useState(false);
  const [channel, setChannel] = useState<Channel>('Webchat');
  return <>
    <section id="possibilities" className="product-section integration-overview product-reveal" aria-labelledby="integration-overview-title">
      <div className="integration-intro"><h2 id="integration-overview-title">Your knowledge. Put to work.</h2><p>One knowledge base. Every conversation.</p></div>
      <KnowledgeMap channel={channel} onChannelChange={setChannel} updated={updated} />
      <div className="integration-update" aria-labelledby="integration-update-title">
        <div className="integration-update-copy"><h3 id="integration-update-title">Update once. Answer everywhere.</h3><p>Choose a channel above. Try a policy update.</p><button type="button" className="product-text-link" aria-controls="integration-answer" onClick={() => setUpdated(value => !value)}>{updated ? 'Reset policy' : 'Try an update'}{updated ? <RotateCcw size={15} /> : <ArrowRight size={16} />}</button></div>
        <div id="integration-answer" className="integration-answer" aria-live="polite" aria-atomic="true"><div className="integration-answer-content" key={`${channel}-${updated}`}><span><ChannelIcon channel={channel} />{channel}</span><p>“You can return an unworn item within <strong>{updated ? '60' : '30'} days.</strong>”</p><small><BookOpen size={12} aria-hidden="true" />Returns policy · {updated ? 'Updated' : 'Original'}<span>Example</span></small></div></div>
      </div>
    </section>
    <ConnectionWalkthrough />
  </>;
}
