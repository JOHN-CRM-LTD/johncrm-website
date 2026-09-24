export type StoryLanguage = 'en' | 'zh-HK' | 'zh-CN';

export interface StoryController {
  setLanguage(language: StoryLanguage): void;
  destroy(): void;
}

export function mountProductStory(root: ShadowRoot, options: {
  host: HTMLElement;
  language: StoryLanguage;
  onNavigate(section: 'pricing' | 'contact'): void;
  onSectionTransition(navigate: () => void): void;
  onToneChange?(dark: number): void;
}): StoryController;
