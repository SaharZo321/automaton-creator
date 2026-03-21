import katex from 'katex';

export function isLatex(text: string): boolean {
  return /\$[^$]+\$/.test(text);
}

export function renderLatex(text: string): string {
  if (!isLatex(text)) {
    return escapeHtml(text);
  }

  // Replace all $...$ with rendered KaTeX
  return text.replace(/\$([^$]+)\$/g, (_match, math: string) => {
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return escapeHtml(math);
    }
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
