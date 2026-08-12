import React from 'react';
import { Font, Text } from '@react-pdf/renderer';

import NotoSansDevanagari from '@/app/api/helperfile/static/font/NotoSansDevanagari';
import NotoSansDevanagariBold from '@/app/api/helperfile/static/font/NotoSansDevanagariBold';
import NotoSansGujaratiRegular from '@/app/api/helperfile/static/font/NotoSansGujarati-Regular';
import NotoSansGujaratiBold from '@/app/api/helperfile/static/font/NotoSansGujarati-Bold';

/**
 * Font helper for react-pdf documents that mix Hindi (Devanagari) and
 * Gujarati text.
 *
 * A single TTF cannot render both scripts, so every piece of text has to be
 * drawn with the font that actually contains its glyphs. `AutoText` looks at
 * the unicode range of the string and picks the font automatically - Hindi
 * text gets NotoSansDevanagari, Gujarati text gets NotoSansGujarati, and a
 * string that contains both is split into runs so each part is drawn with the
 * right font.
 */

export const FONT_HI = 'NotoSansDevanagari';
export const FONT_GU = 'NotoSansGujarati';

// Default script of the certificates / documents.
export const DEFAULT_LANG = 'gu';
export const DEFAULT_FONT = FONT_GU;

// Font used for text that belongs to no Indic script (latin, digits,
// punctuation, the rupee sign ...). NotoSansDevanagari is used because it is
// the font this project has always rendered such characters with.
export const NEUTRAL_FONT = FONT_HI;

let fontsRegistered = false;

export const registerPdfFonts = () => {
  if (fontsRegistered) return;

  Font.register({
    family: FONT_HI,
    fonts: [
      { src: NotoSansDevanagari, fontWeight: 'normal' },
      { src: NotoSansDevanagariBold, fontWeight: 'bold' },
    ],
  });

  Font.register({
    family: FONT_GU,
    fonts: [
      { src: NotoSansGujaratiRegular, fontWeight: 'normal' },
      { src: NotoSansGujaratiBold, fontWeight: 'bold' },
    ],
  });

  // Indic words must not be broken in the middle by the hyphenator.
  Font.registerHyphenationCallback((word) => [word]);

  fontsRegistered = true;
};

// Register as soon as this module is imported (works on server and client).
registerPdfFonts();

// Gujarati            : U+0A80 - U+0AFF
// Devanagari          : U+0900 - U+097F
// Devanagari Extended : U+A8E0 - U+A8FF
const GUJARATI_RE = /[\u0A80-\u0AFF]/;
const DEVANAGARI_RE = /[\u0900-\u097F\uA8E0-\uA8FF]/;

const isGujaratiChar = (ch) => GUJARATI_RE.test(ch);
const isDevanagariChar = (ch) => DEVANAGARI_RE.test(ch);

/** Returns 'gu' | 'hi' | null for a string. */
export const detectScript = (text) => {
  if (text === null || text === undefined) return null;
  const str = String(text);
  for (const ch of str) {
    if (isGujaratiChar(ch)) return 'gu';
    if (isDevanagariChar(ch)) return 'hi';
  }
  return null;
};

export const fontForScript = (script, fallback = NEUTRAL_FONT) => {
  if (script === 'gu') return FONT_GU;
  if (script === 'hi') return FONT_HI;
  return fallback;
};

/** Font family for a whole string (first script found wins). */
export const fontForText = (text, fallback = NEUTRAL_FONT) =>
  fontForScript(detectScript(text), fallback);

/**
 * Splits a string into runs of the same script. Neutral characters
 * (spaces, digits, latin, punctuation, ₹, /, - ...) stick to the run they
 * follow so numbers and separators never create extra fragments.
 */
export const splitByScript = (text) => {
  const str = String(text ?? '');
  const runs = [];
  let current = null;

  for (const ch of str) {
    let script = null;
    if (isGujaratiChar(ch)) script = 'gu';
    else if (isDevanagariChar(ch)) script = 'hi';
    else script = current ? current.script : null;

    if (current && current.script === script) {
      current.text += ch;
    } else {
      current = { script, text: ch };
      runs.push(current);
    }
  }

  return runs;
};

const flattenChildren = (children) =>
  React.Children.toArray(children)
    .map((child) => {
      if (child === null || child === undefined || typeof child === 'boolean') return '';
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      return '';
    })
    .join('');

const toStyleArray = (style) =>
  (Array.isArray(style) ? style : [style]).filter(Boolean);

/**
 * Drop-in replacement for react-pdf's <Text> that selects the font family
 * from the content itself.
 *
 * <AutoText style={styles.label}>નામ:</AutoText>      -> Gujarati font
 * <AutoText style={styles.label}>नाम:</AutoText>      -> Devanagari font
 * <AutoText>{member.displayName}</AutoText>           -> whichever it is
 *
 * `fallbackFont` is used for pure latin/number content (defaults to NEUTRAL_FONT).
 */
export const AutoText = ({ children, style, fallbackFont = NEUTRAL_FONT, ...rest }) => {
  const text = flattenChildren(children);
  const runs = splitByScript(text);

  if (runs.length <= 1) {
    return (
      <Text
        style={[...toStyleArray(style), { fontFamily: fontForText(text, fallbackFont) }]}
        {...rest}
      >
        {text}
      </Text>
    );
  }

  // Mixed Hindi + Gujarati in one string -> one nested <Text> per run.
  return (
    <Text style={[...toStyleArray(style), { fontFamily: fallbackFont }]} {...rest}>
      {runs.map((run, index) => (
        <Text
          key={`${run.script || 'neutral'}-${index}`}
          style={{ fontFamily: fontForScript(run.script, fallbackFont) }}
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
};

export default AutoText;
