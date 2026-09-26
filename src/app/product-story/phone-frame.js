/** Presentation only. Both the homepage tour and documentation use this shell.
 * Content and signal icons must be trusted, application-owned HTML.
 */
export function phoneScreenMarkup(content, signalIcons) {
  return `<div class="phone-screen"><div class="phone-status"><span>9:41</span><div class="phone-island"></div><span class="phone-signals">${signalIcons}</span></div>${content}<div class="homebar"></div></div>`;
}
