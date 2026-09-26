import { DOC_ARTICLES, localize, type DocBlock } from './content';
import type { LanguageCode } from '../translations/language';

export function blockText(block: DocBlock, language: LanguageCode): string {
  switch (block.type) {
    case 'paragraph': return localize(block.text, language);
    case 'steps':
    case 'list': return block.items.map(item => localize(item, language)).join(' ');
    case 'note': return `${localize(block.title, language)} ${localize(block.text, language)}`;
    case 'accordion': return `${localize(block.title, language)} ${block.body.map(item => localize(item, language)).join(' ')}`;
    case 'code': return block.code;
  }
}

export function searchDocs(query: string, language: LanguageCode) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return DOC_ARTICLES.flatMap(article => article.sections.map(section => {
    const title = localize(article.title, language);
    const heading = localize(section.title, language);
    const body = section.blocks.map(block => blockText(block, language)).join(' ');
    const haystack = `${title} ${localize(article.description, language)} ${heading} ${body}`.toLocaleLowerCase();
    return {
      href: `${article.path}#${section.id}`, title, heading,
      score: terms.every(term => haystack.includes(term))
        ? 1 + terms.reduce((score, term) => score + (heading.toLocaleLowerCase().includes(term) ? 4 : 0) + (title.toLocaleLowerCase().includes(term) ? 2 : 0), 0)
        : 0,
    };
  })).filter(result => result.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);
}
