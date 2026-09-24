import { usePageTranslation } from '../translations/language';
import { INDUSTRY_COPY } from '../translations/industry';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Check, CheckCheck, ChevronRight, MessageCircle, Sparkles } from 'lucide-react';
import { INDUSTRIES, type IndustrySlug } from '../industries/catalog';
import { INDUSTRY_CONTENT, type IndustryScene } from '../industries/content';
import '../../styles/industry-pages.css';

function ConversationScene({ scene }: { scene: IndustryScene }) {
  const { t } = usePageTranslation(INDUSTRY_COPY);
  const Icon = scene.icon;
  return <div className="industry-conversation">
    <div className="industry-conversation__header">
      <span className="industry-john-mark"><Sparkles size={21} strokeWidth={1.5} aria-hidden="true" /></span>
      <span><strong>JOHN</strong><small>{t(scene.channel)}</small></span>
      <span className="industry-example-label">{t("Example")}</span>
      <MessageCircle size={20} strokeWidth={1.5} aria-hidden="true" />
    </div>
    <div className="industry-conversation__body">
      <p className="industry-conversation__recipient">{t(scene.recipient)}</p>
      <div className="industry-message industry-message--customer"><p>{t(scene.question)}</p><CheckCheck size={14} aria-hidden="true" /></div>
      <div className="industry-message industry-message--john"><p>{t(scene.answer)}</p></div>
      <div className="industry-result">
        <Icon size={24} strokeWidth={1.4} aria-hidden="true" />
        <h3>{t(scene.result.title)}</h3>
        <dl>{scene.result.rows.map(([label, value]) => <div key={label}><dt>{t(label)}</dt><dd>{t(value)}</dd></div>)}</dl>
        <p><Check size={14} aria-hidden="true" />{t(scene.result.status)}</p>
      </div>
    </div>
    <div className="industry-conversation__footer"><span /><p>{t("Connected to your business. Ready to help.")}</p></div>
  </div>;
}

function IndustryStory({ industry }: { industry: IndustrySlug }) {
  const { t } = usePageTranslation(INDUSTRY_COPY);
  const content = INDUSTRY_CONTENT[industry];
  const [selected, setSelected] = useState(0);
  const scene = content.scenes[selected];

  return <section id="industry-story" className="industry-story" aria-labelledby="industry-story-heading">
    <div className="industry-story__inner">
      <div className="industry-story__intro industry-reveal">
        <h2 id="industry-story-heading">{t(content.storyTitle[0])}<br />{t(content.storyTitle[1])}</h2>
        <p>{t(content.storyIntro)}</p>
      </div>
      <div className="industry-story__layout">
        <div className="industry-story__direction industry-reveal">
          <div role="tablist" aria-label={t(`${INDUSTRIES.find(item => item.slug === industry)!.name} use cases`)} aria-orientation="vertical" className="industry-scene-tabs">
            {content.scenes.map(({ label, icon: Icon }, index) => <button key={label} type="button" role="tab"
              id={`industry-scene-${index}`} aria-selected={selected === index} aria-controls="industry-scene-panel"
              tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)}
              onKeyDown={event => {
                if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? content.scenes.length - 1 :
                  (selected + (event.key === 'ArrowDown' ? 1 : content.scenes.length - 1)) % content.scenes.length;
                setSelected(next); document.getElementById(`industry-scene-${next}`)?.focus();
              }}>
              <span className="industry-scene-number">0{index + 1}</span><Icon size={19} strokeWidth={1.5} aria-hidden="true" /><span>{t(label)}</span><ChevronRight size={17} aria-hidden="true" />
            </button>)}
          </div>
          <div className="industry-scene-description" key={selected}>
            <h3>{t(scene.heading)}</h3><p>{t(scene.description)}</p>
          </div>
          <div className="industry-scene-navigation">
            <span className="industry-scene-count">0{selected + 1}<span> / 0{content.scenes.length}</span></span>
            <button className="industry-scene-arrow" type="button" aria-label={t("Previous scene")} disabled={selected === 0} onClick={() => setSelected(selected - 1)}><ArrowLeft size={17} aria-hidden="true" /></button>
            <button className="industry-scene-arrow" type="button" aria-label={t("Next scene")} disabled={selected === content.scenes.length - 1} onClick={() => setSelected(selected + 1)}><ArrowRight size={17} aria-hidden="true" /></button>
          </div>
          <p className="industry-story-note">{t("Illustrative workflows, configured around your business.")}</p>
        </div>
        <div className="industry-stage-wrap industry-reveal">
          <div id="industry-scene-panel" role="tabpanel" aria-labelledby={`industry-scene-${selected}`} tabIndex={0} className="industry-stage" aria-live="polite">
            <div key={selected} className="industry-stage__scene"><ConversationScene scene={scene} /></div>
          </div>
          <p className="industry-scene-source"><span aria-hidden="true" /><span>{t(scene.source)}</span></p>
        </div>
      </div>
    </div>
  </section>;
}

export default function IndustryPage({ industry }: { industry: IndustrySlug }) {
  const { t, lang } = usePageTranslation(INDUSTRY_COPY);
  const ref = useRef<HTMLElement>(null);
  const content = INDUSTRY_CONTENT[industry];
  const currentIndustry = INDUSTRIES.find(item => item.slug === industry)!;
  const NotificationIcon = content.scenes[0].icon;

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    document.title = `${t(currentIndustry.name)} · JOHN CRM`;
    if (meta) meta.content = t(content.description);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    ref.current?.querySelectorAll('.industry-reveal').forEach(element => observer.observe(element));
    return () => {
      observer.disconnect(); document.title = previousTitle;
      if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, [content, currentIndustry.name, t]);

  return <main ref={ref} className={`industry-page industry-page--${industry}`} lang={lang}>
    <section className="industry-hero">
      <div className="industry-hero__copy">
        <h1><span>{t(content.title[0])}</span><span>{t(content.title[1])}</span></h1>
        <p>{t(content.description)}</p>
        <div className="industry-hero__actions">
          <a className="industry-button" href="/#contact">{t("See JOHN in action")}<ArrowRight size={17} aria-hidden="true" /></a>
          <a className="industry-text-link" href="#industry-story">{t("Explore the story")}<ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <figure className="industry-hero__art">
        <div className="industry-hero__frame">
          <img className="industry-cinema" src={content.image} alt={t(content.alt)} width="1536" height="1024" loading="eager" />
          <div className="industry-notification">
            <span><NotificationIcon size={21} strokeWidth={1.5} aria-hidden="true" /></span>
            <div><strong>{t(content.notification[0])}</strong><p>{t(content.notification[1])}</p></div>
            <Check size={16} aria-hidden="true" />
          </div>
        </div>
        <figcaption>{t(`JOHN for ${currentIndustry.name.toLowerCase()}`)}<span>{t("Illustrative experience")}</span></figcaption>
      </figure>
    </section>
    <section className="industry-features" aria-label={t(`${currentIndustry.name} capabilities`)}>
      {content.features.map(({ icon: Icon, title, body }, index) => <article className="industry-reveal" style={{ '--reveal-delay': `${index * 100}ms` } as CSSProperties} key={title}>
        <Icon size={29} strokeWidth={1.3} aria-hidden="true" /><div><h2>{t(title)}</h2><p>{t(body)}</p></div>
      </article>)}
    </section>
    <IndustryStory key={industry} industry={industry} />
    <section className="industry-connections industry-reveal">
      <div className="industry-connections__copy"><h2>{t(content.connectionTitle[0])}<br />{t(content.connectionTitle[1])}</h2><p>{t(content.connectionBody)}</p>
        <a className="industry-text-link" href="/product/integrations">{t("Explore integrations")}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <ol className="industry-connection-path">{content.connections.map(({ icon: Icon, title, detail }, index) => <li key={title}>
        <span className={`industry-connection-icon${index === 1 ? ' industry-connection-icon--john' : ''}`}><Icon size={25} strokeWidth={1.4} aria-hidden="true" /></span>
        <div><h3>{t(title)}</h3><p>{t(detail)}</p></div><span className="industry-connection-check"><Check size={14} aria-hidden="true" /></span>
      </li>)}</ol>
    </section>
    <section className="industry-closing industry-reveal"><div><h2>{t(content.closing[0])}</h2><p>{t(content.closing[1])}</p></div><a className="industry-button industry-button--light" href="/#contact">{t("Talk to our team")}<ArrowRight size={17} aria-hidden="true" /></a></section>
    <nav className="industry-explore" aria-label={t("Explore other industries")}><span>{t("More ways to work with JOHN")}</span><div>{INDUSTRIES.filter(item => item.slug !== industry).map(({ slug, name }) => <a key={slug} href={`/industries/${slug}`}>{t(name)}<ArrowRight size={14} aria-hidden="true" /></a>)}</div></nav>
  </main>;
}
