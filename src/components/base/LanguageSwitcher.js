"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';

/**
 * Google Website Translator based language switcher.
 *
 * The app is authored in English, so English is the default / original
 * language and no translation runs until the user picks Gujarati or Hindi.
 * The choice is stored in the `googtrans` cookie so it survives a hard
 * refresh and applies to every page of the panel.
 *
 * The stock Google widget (and its top banner) is hidden with CSS in
 * globals.css - only this antd <Select> is visible.
 */

const COOKIE_NAME = 'googtrans';
const DEFAULT_LANG = 'en';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'gu', label: 'ગુજરાતી', short: 'GU' },
  { code: 'hi', label: 'हिन्दी', short: 'HI' },
];

const INCLUDED = LANGUAGES.map((l) => l.code).join(',');

/* ------------------------------------------------------------------ */
/* cookie helpers                                                      */
/* ------------------------------------------------------------------ */

const readCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const hostVariants = () => {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  // localhost cannot take a domain= attribute, so only the plain cookie there.
  if (!host || host === 'localhost' || /^[\d.]+$/.test(host)) return [null];
  return [null, host, `.${host}`];
};

const writeGoogTrans = (lang) => {
  const value = `/${DEFAULT_LANG}/${lang}`;
  hostVariants().forEach((domain) => {
    document.cookie =
      `${COOKIE_NAME}=${value};path=/;max-age=31536000` +
      (domain ? `;domain=${domain}` : '');
  });
};

const clearGoogTrans = () => {
  hostVariants().forEach((domain) => {
    document.cookie =
      `${COOKIE_NAME}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT` +
      (domain ? `;domain=${domain}` : '');
  });
};

/** Reads the language currently active according to the cookie. */
const getActiveLang = () => {
  const cookie = readCookie(COOKIE_NAME); // shape: /en/gu
  if (!cookie) return DEFAULT_LANG;
  const parts = cookie.split('/');
  const lang = parts[2] || DEFAULT_LANG;
  return LANGUAGES.some((l) => l.code === lang) ? lang : DEFAULT_LANG;
};

/* ------------------------------------------------------------------ */
/* React 19 <-> Google Translate DOM guard                             */
/* ------------------------------------------------------------------ */
/*
 * Google Translate rewrites text nodes outside of React's knowledge. When
 * React later tries to remove/replace one of those nodes it can throw
 * "NotFoundError: Failed to execute 'removeChild' on 'Node'" and blank the
 * page. Making these two calls no-ops when the node no longer belongs to the
 * expected parent is the standard mitigation.
 */
const patchDomForTranslate = () => {
  if (typeof Node !== 'function' || !Node.prototype || window.__gtDomPatched) return;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild(child) {
    if (child.parentNode !== this) return child;
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) return newNode;
    return originalInsertBefore.apply(this, arguments);
  };

  window.__gtDomPatched = true;
};

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

const LanguageSwitcher = ({ compact = false, style }) => {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    patchDomForTranslate();
    setLang(getActiveLang());

    // Google calls this once the widget script has loaded.
    window.googleTranslateElementInit = () => {
      if (window.__gtWidgetReady || !window.google?.translate?.TranslateElement) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: DEFAULT_LANG,
          includedLanguages: INCLUDED,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
      window.__gtWidgetReady = true;
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, []);

  /** Drives Google's hidden <select> so the page switches without a reload. */
  const applyViaWidget = (code) => {
    const combo = document.querySelector('select.goog-te-combo');
    if (!combo) return false;
    combo.value = code === DEFAULT_LANG ? '' : code;
    combo.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  const handleChange = (code) => {
    setLang(code);

    if (code === DEFAULT_LANG) {
      clearGoogTrans();
    } else {
      writeGoogTrans(code);
    }

    // Falling back to a reload guarantees the switch even if the widget has
    // not finished loading yet.
    if (!applyViaWidget(code)) {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Google mounts its widget here; hidden via globals.css */}
      <div id="google_translate_element" />

      <Select
        value={lang}
        onChange={handleChange}
        className="lang-select notranslate"
        style={{ width: compact ? 92 : 132, ...style }}
        size="middle"
        popupClassName="notranslate"
        suffixIcon={<FiChevronDown size={13} className="text-slate-400" />}
        options={LANGUAGES.map((l) => ({
          value: l.code,
          label: (
            <span
              className="notranslate"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FiGlobe size={13} style={{ flexShrink: 0, opacity: 0.65 }} />
              {compact ? l.short : l.label}
            </span>
          ),
        }))}
      />
    </>
  );
};

export default LanguageSwitcher;
