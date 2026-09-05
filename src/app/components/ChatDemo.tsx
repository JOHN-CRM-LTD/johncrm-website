import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CheckCheck, Hotel, House, ShieldCheck, ShoppingBag } from 'lucide-react';
import { CHAT_DEMO_COPY, type ChatScenario, type DemoCopy, type DemoLanguage } from './chat-demo-content';
import { clampChatProgress, getChatExitState, getChatScrollState, getMessageReveal } from './chat-demo-motion';
import ChatWireframeBackdrop from './ChatWireframeBackdrop';
import { MotionLines, Reveal } from './SectionMotion';
import '../../styles/chat-demo.css';

const INDUSTRY_ICONS = { insurance: ShieldCheck, retail: ShoppingBag, property: House, hospitality: Hotel };

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function ChatBubble({ text, outgoing, index }: { text: string; outgoing: boolean; index: number }) {
  return (
    <div
      className={`chat-demo-bubble ${outgoing ? 'is-outgoing' : 'is-incoming'}`}
      style={{ '--message-reveal': `var(--chat-reveal-${index}, 1)` } as CSSProperties}
    >
      <p>{text}</p>
      <span className="chat-demo-message-time" aria-hidden="true">10:24{outgoing && <CheckCheck size={13} />}</span>
    </div>
  );
}

function MessageGroup({ scenario, chapter, standard, active }: {
  scenario: ChatScenario; chapter: number; standard: boolean; active: boolean;
}) {
  const messages = standard
    ? [scenario.question, scenario.standardReply, scenario.standardFollowUp]
    : [scenario.question, scenario.reply, scenario.followUp, scenario.finalReply];
  return (
    <div
      className="chat-demo-message-group"
      data-chat-chapter={chapter}
      data-theme={scenario.id}
      aria-hidden={!active}
      style={{ '--chat-page': chapter } as CSSProperties}
    >
      {messages.map((message, index) => <ChatBubble key={index} text={message} outgoing={index % 2 === 0} index={index} />)}
    </div>
  );
}

function ChatWindow({ scenarios, active, standard, copy, flow = false }: {
  scenarios: ChatScenario[]; active: number; standard: boolean; copy: DemoCopy; flow?: boolean;
}) {
  const scenario = scenarios[active];
  const Icon = INDUSTRY_ICONS[scenario.id];
  const prefix = standard ? copy.standard : 'JOHN CRM';
  const title = `${prefix} - ${scenario.industry}`;
  return (
    <div className={`chat-demo-column ${standard ? 'chat-demo-standard' : 'chat-demo-john'}`}>
      <div className="chat-demo-window" data-flow-window={flow || undefined} role="group" aria-label={title}>
        <div className="chat-demo-window-header">
          <span className="chat-demo-avatar" aria-hidden="true"><Icon size={20} strokeWidth={1.6} /></span>
          <h3 aria-label={title}>
            <span aria-hidden="true">{prefix} - </span>
            <span
              className="chat-demo-typed-name"
              key={scenario.industry}
              style={{ '--name-length': scenario.industry.length } as CSSProperties}
              aria-hidden="true"
            >{scenario.industry}</span>
          </h3>
          <span className="chat-demo-status-dot" aria-hidden="true" />
        </div>
        <div className="chat-demo-message-viewport">
          {scenarios.map((item, chapter) => (
            <MessageGroup key={item.id} scenario={item} chapter={chapter} standard={standard} active={chapter === active} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Comparison({ scenarios, active, copy, flow = false }: {
  scenarios: ChatScenario[]; active: number; copy: DemoCopy; flow?: boolean;
}) {
  return (
    <div className="chat-demo-comparison" data-industry={scenarios[active].id} data-theme={scenarios[active].id}>
      <ChatWindow scenarios={scenarios} active={active} standard copy={copy} flow={flow} />
      <ChatWindow scenarios={scenarios} active={active} standard={false} copy={copy} flow={flow} />
    </div>
  );
}

function applyMessageProgress(group: HTMLElement, progress: number) {
  for (let index = 0; index < 4; index += 1) {
    group.style.setProperty(`--chat-reveal-${index}`, String(getMessageReveal(progress, index)));
  }
  group.dataset.progress = progress.toFixed(3);
}

export default function ChatDemo({ language }: { language: DemoLanguage }) {
  const copy = CHAT_DEMO_COPY[language];
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const wide = useMediaQuery('(min-width: 900px) and (min-height: 720px)');
  const pinned = wide && !reducedMotion;
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const total = copy.scenarios.length;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const groups = [...section.querySelectorAll<HTMLElement>('[data-chat-chapter]')];
    const windows = [...section.querySelectorAll<HTMLElement>('[data-flow-window]')];
    let frame = 0;

    const measure = () => {
      const sectionRect = section.getBoundingClientRect();
      const exit = reducedMotion ? { travel: 0, opacity: 1 } : getChatExitState(sectionRect.bottom, window.innerHeight, pinned);
      section.style.setProperty('--chat-exit-travel', String(exit.travel));
      section.style.setProperty('--chat-exit-opacity', String(exit.opacity));
      if (pinned) {
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        const progress = -sectionRect.top / travel;
        const state = getChatScrollState(progress, total);
        section.style.setProperty('--chat-track', String(state.track));
        for (const group of groups) {
          const chapter = Number(group.dataset.chatChapter);
          applyMessageProgress(group, chapter < state.chapter ? 1 : chapter > state.chapter ? 0 : state.local);
        }
        if (activeRef.current !== state.active) {
          activeRef.current = state.active;
          setActive(state.active);
        }
      } else {
        section.style.setProperty('--chat-track', '0');
        for (const card of windows) {
          const progress = reducedMotion ? 1 : clampChatProgress(
            (window.innerHeight * 0.88 - card.getBoundingClientRect().top) / (window.innerHeight * 0.85),
          );
          const group = card.querySelector<HTMLElement>('[data-chat-chapter]');
          if (group) applyMessageProgress(group, progress);
        }
      }
      frame = 0;
    };

    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(section);
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pinned, reducedMotion, total, language]);

  return (
    <section
      id="chat-demo" ref={sectionRef} aria-labelledby="chat-demo-heading" data-motion-section
      className={`chat-demo ${pinned ? 'is-pinned' : 'is-flow'} ${language !== 'EN' ? 'is-cjk' : ''}`}
      style={{ '--chapter-count': total } as CSSProperties}
    >
      <div className="chat-demo-stage">
        {pinned && <ChatWireframeBackdrop reducedMotion={reducedMotion} />}
        <div className="chat-demo-inner" data-motion-reveal="chat">
          <Reveal kind="heading">
            <header className="chat-demo-heading"><h2 id="chat-demo-heading"><MotionLines lines={[copy.heading]} /></h2></header>
          </Reveal>
          {pinned && <Comparison scenarios={copy.scenarios} active={active} copy={copy} />}
          {!pinned && <div className="chat-demo-flow-scenes">{copy.scenarios.map((scenario, index) => (
            <article className="chat-demo-flow-scene" id={`chat-demo-${scenario.id}`} key={scenario.id} aria-label={scenario.industry}>
              <ChatWireframeBackdrop industryIndex={index} reducedMotion={reducedMotion} />
              <Comparison scenarios={[scenario]} active={0} copy={copy} flow />
            </article>
          ))}</div>}
        </div>
      </div>
    </section>
  );
}
