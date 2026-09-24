import { useLayoutEffect, useRef } from 'react';
import markup from '../product-story/story.html?raw';
import styles from '../product-story/story.css?raw';
import productPhoto from '../../assets/product-demo/red-sweatshirt.jpg';
import { mountProductStory, type StoryController, type StoryLanguage } from '../product-story/runtime.js';
import { createSectionTransition } from '../../lib/sectionTransition';
import { createHomePageEntrance } from '../../lib/homePageEntrance';

const storyMarkup = `<style>${styles}</style>${markup.replace('__RETAIL_PHOTO_URL__', productPhoto)}`;
const languages = { EN: 'en', HK: 'zh-HK', CN: 'zh-CN' } as const;

function navigateTo(section: 'pricing' | 'contact') {
  const target = document.getElementById(section);
  if (!target) return;
  if (location.hash !== `#${section}`) history.pushState(null, '', `#${section}`);
  target.scrollIntoView({ behavior: 'instant' });
  target.focus({ preventScroll: true });
}

/** Keeps the supplied HTML's styling isolated, with the website's native scroll. */
export default function ProductStory({ language }: { language: keyof typeof languages }) {
  const hostRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<StoryController | null>(null);
  const initialLanguage = useRef<StoryLanguage>(languages[language]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    root.innerHTML = storyMarkup;
    const landing = host.closest<HTMLElement>('.landing-site');
    const transition = createSectionTransition(landing ?? host);
    const controller = mountProductStory(root, {
      host,
      language: initialLanguage.current,
      onNavigate: (section) => transition.run(() => navigateTo(section)),
      onSectionTransition: transition.run,
      // Share the scene tone without re-rendering React on every scroll frame.
      onToneChange: (dark) => landing?.style.setProperty('--story-dark', String(dark)),
    });
    controllerRef.current = controller;
    const destroyEntrance = createHomePageEntrance(host.closest('main') ?? host);
    return () => {
      destroyEntrance();
      transition.destroy();
      controller.destroy();
      landing?.style.removeProperty('--story-dark');
      controllerRef.current = null;
      root.replaceChildren();
    };
  }, []);

  useLayoutEffect(() => {
    controllerRef.current?.setLanguage(languages[language]);
  }, [language]);

  return <section id="top" ref={hostRef} tabIndex={-1} className="product-story" aria-label="JOHN CRM product tour" />;
}
