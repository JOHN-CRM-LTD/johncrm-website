export const clampChatProgress = (value: number) => Math.max(0, Math.min(1, value));

/** Clear the final comparison as the following poster enters the viewport. */
export function getChatExitState(sectionBottom: number, viewport: number, pinned = true) {
  // Flow layouts need the final card to enter fully before starting its exit.
  const start = pinned ? 1.5 : .9;
  const progress = clampChatProgress((viewport * start - sectionBottom) / Math.max(1, viewport * .65));
  const fade = clampChatProgress((progress - .6) / .4);
  return {
    travel: progress * progress * (3 - 2 * progress),
    opacity: 1 - fade * fade * (3 - 2 * fade),
  };
}

/** Scroll position is the playback clock; no elapsed-time state is needed. */
export function getChatScrollState(progress: number, count: number) {
  const position = clampChatProgress(progress) * count;
  const chapter = Math.min(count - 1, Math.floor(position));
  const local = position - chapter;
  const transition = chapter < count - 1 ? clampChatProgress((local - 0.82) / 0.18) : 0;
  const easedTransition = transition * transition * (3 - 2 * transition);
  return {
    chapter,
    local,
    active: chapter + (transition >= 0.5 ? 1 : 0),
    track: chapter + easedTransition,
  };
}

export function getMessageReveal(progress: number, message: number) {
  if (message === 0) return 1;
  const start = [0, 0.09, 0.2, 0.31][message] ?? 0.31;
  return clampChatProgress((progress - start) / 0.07);
}
