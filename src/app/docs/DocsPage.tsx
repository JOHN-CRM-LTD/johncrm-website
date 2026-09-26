import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Copy, ExternalLink, Hash, Info, Search, X } from 'lucide-react';
import { LanguageContext, LANGUAGE_TAGS, type LanguageCode } from '../translations/language';
import { DOC_ARTICLES, localize, type DocBlock, type LocalizedText } from './content';
import { DOCS_UI } from './ui';
import { searchDocs } from './search';
import DocsIllustration from './DocsIllustration';
import '../../styles/docs.css';

function CodeExample({ code, label, language }: { code: string; label: string; language: LanguageCode }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      setStatus('copied');
      timer.current = setTimeout(() => setStatus('idle'), 2400);
    } catch { setStatus('failed'); }
  };
  return <div className="docs-code">
    <div className="docs-code-toolbar"><span>{label}</span><button type="button" onClick={copy}>
      {status === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      {localize(status === 'copied' ? DOCS_UI.copied : DOCS_UI.copy, language)}
    </button></div>
    <pre tabIndex={0} aria-label={label}><code>{code}</code></pre>
    <span className={status === 'failed' ? 'docs-copy-feedback' : 'sr-only'} role="status">
      {status === 'failed' ? localize(DOCS_UI.copyFailed, language) : status === 'copied' ? localize(DOCS_UI.copied, language) : ''}
    </span>
  </div>;
}

function Block({ block, language }: { block: DocBlock; language: LanguageCode }) {
  const l = (text: LocalizedText) => localize(text, language);
  switch (block.type) {
    case 'paragraph': return <p>{l(block.text)}</p>;
    case 'steps': return <ol className="docs-steps">{block.items.map((item, i) => <li key={i}><span className="docs-step-number" aria-hidden="true">{i + 1}</span><span>{l(item)}</span></li>)}</ol>;
    case 'list': return <ul className="docs-list">{block.items.map((item, i) => <li key={i}>{l(item)}</li>)}</ul>;
    case 'note': return <aside className="docs-note"><Info size={18} aria-hidden="true" /><div><strong>{l(block.title)}</strong><p>{l(block.text)}</p></div></aside>;
    case 'code': return <CodeExample {...block} language={language} />;
    case 'accordion': return <details className="docs-disclosure"><summary>{l(block.title)}<ChevronDown size={16} aria-hidden="true" /></summary><div>{block.body.map((text, i) => <p key={i}>{l(text)}</p>)}</div></details>;
  }
}

export default function DocsPage({ path }: { path: string }) {
  const language = useContext(LanguageContext);
  const l = (text: LocalizedText) => localize(text, language);
  const article = DOC_ARTICLES.find(item => item.path === (path.replace(/\/+$/, '') || '/docs'));
  const articleIndex = DOC_ARTICLES.findIndex(item => item === article);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(article?.sections[0]?.id ?? '');
  const searchInput = useRef<HTMLInputElement>(null);
  const mobileNav = useRef<HTMLDetailsElement>(null);
  const mobileContents = useRef<HTMLDetailsElement>(null);
  const results = useMemo(() => searchDocs(query, language), [query, language]);
  const searching = query.trim().length > 0;
  const title = article ? l(article.title) : l(DOCS_UI.notFound);
  const description = article ? l(article.description) : l(DOCS_UI.notFoundBody);

  useEffect(() => {
    document.title = `${title} · ${localize(DOCS_UI.brand, language)}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description, language]);

  useEffect(() => {
    if (!article) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 88;
      let current = article.sections[0]?.id ?? '';
      for (const section of article.sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= header + 48) current = section.id;
      }
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = article.sections.at(-1)?.id ?? current;
      setActiveId(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    // Lazy-loaded content may arrive after the browser's initial fragment jump.
    const initialFrame = requestAnimationFrame(() => {
      let id = '';
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { /* Invalid fragments have no target. */ }
      if (article.sections.some(section => section.id === id)) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
      update();
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(initialFrame);
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll);
    };
  }, [article]);

  const topicLinks = <>{(['start', 'work', 'manage'] as const).map(group => <div className="docs-nav-group" key={group}>
    <p>{l(DOCS_UI[group])}</p>
    {DOC_ARTICLES.filter(item => item.group === group).map(item => <a key={item.path} href={item.path}
      aria-current={item === article ? 'page' : undefined} onClick={() => { if (mobileNav.current) mobileNav.current.open = false; }}>
      {l(item.title)}<ArrowRight size={13} aria-hidden="true" />
    </a>)}
  </div>)}</>;
  const contents = <nav aria-label={l(DOCS_UI.onPage)}>{article?.sections.map(section => <a key={section.id} href={`#${section.id}`}
    aria-current={activeId === section.id ? 'location' : undefined}
    onClick={() => { if (mobileContents.current) mobileContents.current.open = false; }}>
    {l(section.title)}
  </a>)}</nav>;

  return <main className="docs-page" lang={LANGUAGE_TAGS[language]}>
    <a className="docs-skip" href="#docs-article">{l(DOCS_UI.skip)}</a>
    <div className="docs-toolbar">
      <a className="docs-brand" href="/docs" aria-label={l(DOCS_UI.brand)}><BookOpen size={19} strokeWidth={1.5} aria-hidden="true" /><span>{l(DOCS_UI.documentation)}</span></a>
      <div className="docs-search" onKeyDown={event => { if (event.key === 'Escape') { setQuery(''); searchInput.current?.focus(); } }}>
        <Search size={16} aria-hidden="true" />
        <input ref={searchInput} type="search" placeholder={l(DOCS_UI.search)} aria-label={l(DOCS_UI.searchLabel)}
          value={query} onChange={event => setQuery(event.target.value)} aria-controls={searching ? 'docs-search-results' : undefined} autoComplete="off" />
        {query && <button type="button" onClick={() => { setQuery(''); searchInput.current?.focus(); }} aria-label={l(DOCS_UI.clear)}><X size={15} /></button>}
        {searching && <div className="docs-search-results" id="docs-search-results">
          <p role="status">{results.length ? `${l(DOCS_UI.searchResults)} · ${results.length}` : l(DOCS_UI.noResults)}</p>
          {results.length > 0 && <nav aria-label={l(DOCS_UI.searchResults)}>{results.map(result => <a key={result.href} href={result.href} onClick={() => {
            setQuery('');
            const [resultPath, id] = result.href.split('#');
            if (resultPath === article?.path) requestAnimationFrame(() => document.getElementById(id)?.focus({ preventScroll: true }));
          }}><span>{result.title}</span><strong>{result.heading}</strong><ArrowRight size={15} aria-hidden="true" /></a>)}</nav>}
        </div>}
      </div>
      <a className="docs-open-app" href="https://app.johncrm.com/">{l(DOCS_UI.openApp)}<ExternalLink size={14} aria-hidden="true" /></a>
    </div>
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <nav className="docs-desktop-nav" aria-label={l(DOCS_UI.browse)}>{topicLinks}</nav>
        <details ref={mobileNav} className="docs-mobile-nav"><summary><BookOpen size={16} aria-hidden="true" />{l(DOCS_UI.browse)}<ChevronDown size={16} aria-hidden="true" /></summary><nav aria-label={l(DOCS_UI.browse)}>{topicLinks}</nav></details>
        <a className="docs-sidebar-help" href="/#contact">{l(DOCS_UI.contact)}<ExternalLink size={13} aria-hidden="true" /></a>
      </aside>
      <article id="docs-article" className="docs-article" tabIndex={-1}>
        <header className="docs-article-header"><p className="docs-eyebrow">{article ? l(DOCS_UI[article.group]) : '404'}</p>
          <h1>{title}</h1><p className="docs-description">{description}</p>
        </header>
        {article ? <>
          <details ref={mobileContents} className="docs-inline-contents"><summary>{l(DOCS_UI.onPage)}<ChevronDown size={16} aria-hidden="true" /></summary>{contents}</details>
          <figure className="docs-figure"><DocsIllustration kind={article.figure} language={language} /><figcaption>{l(DOCS_UI.illustration)}</figcaption></figure>
          <div className="docs-article-body">{article.sections.map(section => <section className="docs-section" id={section.id} key={section.id} tabIndex={-1}>
            <h2 aria-label={l(section.title)}><a href={`#${section.id}`} aria-label={`${l(DOCS_UI.link)}: ${l(section.title)}`}><Hash size={17} aria-hidden="true" /></a>{l(section.title)}</h2>
            {section.blocks.map((block, index) => <Block key={index} block={block} language={language} />)}
          </section>)}</div>
          <nav className="docs-pagination" aria-label={l(DOCS_UI.browse)}>
            {articleIndex > 0 ? <a href={DOC_ARTICLES[articleIndex - 1].path}><ArrowLeft size={17} aria-hidden="true" /><span><small>{l(DOCS_UI.previous)}</small><strong>{l(DOC_ARTICLES[articleIndex - 1].title)}</strong></span></a> : <span />}
            {articleIndex < DOC_ARTICLES.length - 1 && <a className="docs-pagination-next" href={DOC_ARTICLES[articleIndex + 1].path}><span><small>{l(DOCS_UI.next)}</small><strong>{l(DOC_ARTICLES[articleIndex + 1].title)}</strong></span><ArrowRight size={17} aria-hidden="true" /></a>}
          </nav>
        </> : <div className="docs-not-found"><a className="docs-return" href="/docs"><ArrowLeft size={16} />{l(DOCS_UI.back)}</a><nav aria-label={l(DOCS_UI.browse)}>{topicLinks}</nav></div>}
        <aside className="docs-help"><div><h2>{l(DOCS_UI.help)}</h2><p>{l(DOCS_UI.helpBody)}</p></div><a href="/#contact">{l(DOCS_UI.contact)}<ArrowRight size={15} aria-hidden="true" /></a></aside>
      </article>
      {article && <aside className="docs-toc"><p><ArrowDown size={13} aria-hidden="true" />{l(DOCS_UI.onPage)}</p>{contents}</aside>}
    </div>
  </main>;
}
