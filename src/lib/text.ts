// Pequenas funções de texto partilhadas pelos componentes.

/** Etiquetas em maiúsculas, com as regras do português. */
export function caps(text: string): string {
  return text.toLocaleUpperCase('pt-PT');
}

/** Junta etiquetas com o separador " · " e põe-nas em maiúsculas. */
export function tagLine(tags: readonly string[]): string {
  return caps(tags.join(' · '));
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

/**
 * Converte *itálico* em <i>itálico</i> e escapa o resto.
 * Serve para nomes científicos em textos curtos (ex.: *Eucalyptus globulus*).
 */
export function inlineItalic(text: string): string {
  return escapeHtml(text).replace(/\*([^*]+)\*/g, '<i>$1</i>');
}
