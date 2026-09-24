import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import johnCrmLogo from '../../assets/johncrm.svg';
import '../../styles/legal-pages.css';

export type LegalPage = 'privacy' | 'terms';

type LegalPageLayoutProps = {
  page: LegalPage;
  title: string;
  updated: string;
  sections: readonly (readonly [string, string])[];
  children: ReactNode;
  footer: ReactNode;
  onNavigate: (page: LegalPage) => void;
};

export default function LegalPageLayout({
  page,
  title,
  updated,
  sections,
  children,
  footer,
  onNavigate,
}: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const mobileContents = useRef<HTMLDetailsElement>(null);

  const handleDocumentLink = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || url.hash || url.search) return;
    const path = url.pathname.replace(/\/+$/, '');
    if (path !== '/privacy-policy' && path !== '/terms-of-service') return;
    event.preventDefault();
    onNavigate(path === '/privacy-policy' ? 'privacy' : 'terms');
  };

  useEffect(() => {
    const elements = sections.map(([id]) => document.getElementById(id));
    let frame = 0;
    const updateSection = () => {
      frame = 0;
      let current = sections[0][0];
      for (const element of elements) {
        if (element && element.getBoundingClientRect().top <= 160) current = element.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1][0];
      }
      setActiveSection(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateSection);
    };
    updateSection();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sections]);

  const contents = sections.map(([id, label], index) => (
    <a
      key={id}
      href={`#${id}`}
      aria-current={activeSection === id ? 'location' : undefined}
      onClick={() => {
        if (mobileContents.current) mobileContents.current.open = false;
      }}
    >
      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      {label}
    </a>
  ));

  return (
    <div className="legal-site" onClick={handleDocumentLink}>
      <a className="legal-skip-link" href="#legal-content">Skip to content</a>
      <header className="legal-header">
        <a href="/" aria-label="JOHN CRM home">
          <img src={johnCrmLogo} alt="JOHN CRM" />
        </a>
        <a className="legal-back-link" href="/">
          <ArrowLeft size={15} strokeWidth={1.65} aria-hidden="true" />
          Back to JOHN CRM
        </a>
      </header>

      <main id="top">
        <section className="legal-hero" aria-labelledby="legal-title">
          <div className="legal-container">
            <h1 id="legal-title">{title}</h1>
            <div className="legal-hero-bottom">
              <p className="legal-updated">{updated}</p>
              <nav className="legal-tabs" data-page={page} aria-label="Legal documents">
                <a href="/privacy-policy" aria-current={page === 'privacy' ? 'page' : undefined}>
                  Privacy Policy
                </a>
                <a href="/terms-of-service" aria-current={page === 'terms' ? 'page' : undefined}>
                  Terms of Service
                </a>
              </nav>
            </div>
          </div>
        </section>

        <div key={page} className="legal-container legal-layout">
          <aside className="legal-sidebar">
            <div className="legal-desktop-contents">
              <p className="legal-contents-label">On this page</p>
              <nav className="legal-contents" aria-label="Table of contents">{contents}</nav>
            </div>
            <details ref={mobileContents} className="legal-mobile-contents">
              <summary>
                On this page
                <ChevronDown size={16} strokeWidth={1.65} aria-hidden="true" />
              </summary>
              <nav className="legal-contents" aria-label="Table of contents">{contents}</nav>
            </details>
          </aside>
          <article id="legal-content" className="legal-article" tabIndex={-1}>
            {children}
          </article>
        </div>
      </main>
      {footer}
    </div>
  );
}
