import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Check, CheckCheck, ChevronRight, MessageCircle, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { INDUSTRIES, type IndustrySlug } from '../industries/catalog';
import { INDUSTRY_CONTENT, type IndustryScene } from '../industries/content';
import '../../styles/industry-pages.css';

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function ConversationScene({ scene }: { scene: IndustryScene }) {
  const Icon = scene.icon;
  return <div className="industry-conversation">
    <div className="industry-conversation__header">
      <span className="industry-john-mark"><Sparkles size={21} strokeWidth={1.5} aria-hidden="true" /></span>
      <span><strong>JOHN</strong><small>{scene.channel}</small></span>
      <span className="industry-example-label">Example</span>
      <MessageCircle size={20} strokeWidth={1.5} aria-hidden="true" />
    </div>
    <div className="industry-conversation__body">
      <p className="industry-conversation__recipient">{scene.recipient}</p>
      <div className="industry-message industry-message--customer"><p>{scene.question}</p><CheckCheck size={14} aria-hidden="true" /></div>
      <div className="industry-message industry-message--john"><p>{scene.answer}</p></div>
      <div className="industry-result">
        <Icon size={24} strokeWidth={1.4} aria-hidden="true" />
        <h3>{scene.result.title}</h3>
        <dl>{scene.result.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <p><Check size={14} aria-hidden="true" />{scene.result.status}</p>
      </div>
    </div>
    <div className="industry-conversation__footer"><span /><p>Connected to your business. Ready to help.</p></div>
  </div>;
}

function IndustryStory({ industry, reducedMotion }: { industry: IndustrySlug; reducedMotion: boolean }) {
  const content = INDUSTRY_CONTENT[industry];
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [replay, setReplay] = useState(0);
  const scene = content.scenes[selected];
  const isRunning = playing && onScreen && pageVisible && !reducedMotion;

  useEffect(() => {
    const observer = new IntersectionObserver(entries => setOnScreen(entries[0].isIntersecting), { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setTimeout(() => {
      if (selected === content.scenes.length - 1) setPlaying(false);
      else setSelected(index => index + 1);
    }, 8500);
    return () => clearTimeout(timer);
  }, [isRunning, selected, content.scenes.length, replay]);

  const choose = (index: number) => { setSelected(index); setPlaying(false); };

  return <section id="industry-story" className="industry-story" ref={ref} aria-labelledby="industry-story-heading">
    <div className="industry-story__inner">
      <div className="industry-story__intro industry-reveal">
        <h2 id="industry-story-heading">{content.storyTitle[0]}<br />{content.storyTitle[1]}</h2>
        <p>{content.storyIntro}</p>
      </div>
      <div className="industry-story__layout">
        <div className="industry-story__direction industry-reveal">
          <div role="tablist" aria-label={`${INDUSTRIES.find(item => item.slug === industry)!.name} use cases`} aria-orientation="vertical" className="industry-scene-tabs">
            {content.scenes.map(({ label, icon: Icon }, index) => <button key={label} type="button" role="tab"
              id={`industry-scene-${index}`} aria-selected={selected === index} aria-controls="industry-scene-panel"
              tabIndex={selected === index ? 0 : -1} onClick={() => choose(index)}
              onKeyDown={event => {
                if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? content.scenes.length - 1 :
                  (selected + (event.key === 'ArrowDown' ? 1 : content.scenes.length - 1)) % content.scenes.length;
                choose(next); document.getElementById(`industry-scene-${next}`)?.focus();
              }}>
              <span className="industry-scene-number">0{index + 1}</span><Icon size={19} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span><ChevronRight size={17} aria-hidden="true" />
            </button>)}
          </div>
          <div className="industry-scene-description" key={selected}>
            <h3>{scene.heading}</h3><p>{scene.description}</p>
          </div>
          <div className="industry-playback">
            {!reducedMotion && <button type="button" className="industry-play" aria-pressed={playing} onClick={() => {
              if (playing) { setPlaying(false); return; }
              if (selected === content.scenes.length - 1) { setSelected(0); setReplay(value => value + 1); }
              setPlaying(true);
            }}>
              {playing ? <Pause size={15} aria-hidden="true" /> : selected === content.scenes.length - 1 ? <RotateCcw size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              {playing ? 'Pause story' : selected === content.scenes.length - 1 ? 'Replay story' : 'Play story'}
            </button>}
            <span className="industry-scene-count">0{selected + 1}<span> / 0{content.scenes.length}</span></span>
            <button className="industry-scene-arrow" type="button" aria-label="Previous scene" disabled={selected === 0} onClick={() => choose(selected - 1)}><ArrowLeft size={17} aria-hidden="true" /></button>
            <button className="industry-scene-arrow" type="button" aria-label="Next scene" disabled={selected === content.scenes.length - 1} onClick={() => choose(selected + 1)}><ArrowRight size={17} aria-hidden="true" /></button>
          </div>
          <p className="industry-story-note">Illustrative workflows, configured around your business.</p>
        </div>
        <div className="industry-stage-wrap industry-reveal">
          <div id="industry-scene-panel" role="tabpanel" aria-labelledby={`industry-scene-${selected}`} tabIndex={0} className="industry-stage" aria-live={playing ? 'off' : 'polite'}>
            <div key={`${selected}-${replay}`} className="industry-stage__scene"><ConversationScene scene={scene} /></div>
          </div>
          <p className="industry-scene-source"><span aria-hidden="true" /><span>{scene.source}</span></p>
        </div>
      </div>
    </div>
  </section>;
}

export default function IndustryPage({ industry }: { industry: IndustrySlug }) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const content = INDUSTRY_CONTENT[industry];
  const currentIndustry = INDUSTRIES.find(item => item.slug === industry)!;
  const NotificationIcon = content.scenes[0].icon;

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    document.title = `${currentIndustry.name} · JOHN CRM`;
    if (meta) meta.content = content.description;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    ref.current?.querySelectorAll('.industry-reveal').forEach(element => observer.observe(element));
    return () => {
      observer.disconnect(); document.title = previousTitle;
      if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, [content, currentIndustry.name]);

  return <main ref={ref} className={`industry-page industry-page--${industry}`} lang="en">
    <section className="industry-hero">
      <div className="industry-hero__copy">
        <h1><span>{content.title[0]}</span><span>{content.title[1]}</span></h1>
        <p>{content.description}</p>
        <div className="industry-hero__actions">
          <a className="industry-button" href="/#contact">See JOHN in action<ArrowRight size={17} aria-hidden="true" /></a>
          <a className="industry-text-link" href="#industry-story">Explore the story<ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <figure className="industry-hero__art">
        <div className="industry-hero__frame">
          <img className="industry-cinema" src={content.image} alt={content.alt} width="1536" height="1024" loading="eager" />
          <div className="industry-notification">
            <span><NotificationIcon size={21} strokeWidth={1.5} aria-hidden="true" /></span>
            <div><strong>{content.notification[0]}</strong><p>{content.notification[1]}</p></div>
            <Check size={16} aria-hidden="true" />
          </div>
        </div>
        <figcaption>JOHN for {currentIndustry.name.toLowerCase()}<span>Illustrative experience</span></figcaption>
      </figure>
    </section>
    <section className="industry-features" aria-label={`${currentIndustry.name} capabilities`}>
      {content.features.map(({ icon: Icon, title, body }, index) => <article className="industry-reveal" style={{ '--reveal-delay': `${index * 100}ms` } as CSSProperties} key={title}>
        <Icon size={29} strokeWidth={1.3} aria-hidden="true" /><div><h2>{title}</h2><p>{body}</p></div>
      </article>)}
    </section>
    <IndustryStory key={industry} industry={industry} reducedMotion={reducedMotion} />
    <section className="industry-connections industry-reveal">
      <div className="industry-connections__copy"><h2>{content.connectionTitle[0]}<br />{content.connectionTitle[1]}</h2><p>{content.connectionBody}</p>
        <a className="industry-text-link" href="/product/integrations">Explore integrations<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <ol className="industry-connection-path">{content.connections.map(({ icon: Icon, title, detail }, index) => <li key={title}>
        <span className={`industry-connection-icon${index === 1 ? ' industry-connection-icon--john' : ''}`}><Icon size={25} strokeWidth={1.4} aria-hidden="true" /></span>
        <div><h3>{title}</h3><p>{detail}</p></div><span className="industry-connection-check"><Check size={14} aria-hidden="true" /></span>
      </li>)}</ol>
    </section>
    <section className="industry-closing industry-reveal"><div><h2>{content.closing[0]}</h2><p>{content.closing[1]}</p></div><a className="industry-button industry-button--light" href="/#contact">Talk to our team<ArrowRight size={17} aria-hidden="true" /></a></section>
    <nav className="industry-explore" aria-label="Explore other industries"><span>More ways to work with JOHN</span><div>{INDUSTRIES.filter(item => item.slug !== industry).map(({ slug, name }) => <a key={slug} href={`/industries/${slug}`}>{name}<ArrowRight size={14} aria-hidden="true" /></a>)}</div></nav>
  </main>;
}
