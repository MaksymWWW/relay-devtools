/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { createContext, useLayoutEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks';

import type { BrowserTheme } from '../DevTools';

export type DisplayDensity = 'comfortable' | 'compact';
export type Theme = 'auto' | 'light' | 'dark';

type Context = {|
  displayDensity: DisplayDensity,
  setDisplayDensity(value: DisplayDensity): void,

  // Derived from display density.
  // Specified as a separate prop so it can trigger a re-render of FixedSizeList.
  lineHeight: number,

  theme: Theme,
  setTheme(value: Theme): void,
|};

const SettingsContext = createContext<Context>(((null: any): Context));
SettingsContext.displayName = 'SettingsContext';

type DocumentElements = Array<HTMLElement>;

type Props = {|
  browserTheme: BrowserTheme,
  children: React$Node,
  rootContainer?: Element,
  networkPortalContainer?: Element,
  settingsPortalContainer?: Element,
|};

function SettingsContextController({
  browserTheme,
  children,
  rootContainer,
  networkPortalContainer,
  settingsPortalContainer,
}: Props) {
  const [displayDensity, setDisplayDensity] = useLocalStorage<DisplayDensity>(
    'Relay::DevTools::displayDensity',
    'compact'
  );
  const [theme, setTheme] = useLocalStorage<Theme>(
    'Relay::DevTools::theme',
    'auto'
  );

  const documentElements = useMemo<DocumentElements>(() => {
    const array: Array<HTMLElement> = [
      ((document.documentElement: any): HTMLElement),
    ];
    if (rootContainer != null) {
      array.push(
        ((rootContainer.ownerDocument.documentElement: any): HTMLElement)
      );
    }
    if (networkPortalContainer != null) {
      array.push(
        ((networkPortalContainer.ownerDocument
          .documentElement: any): HTMLElement)
      );
    }
    if (settingsPortalContainer != null) {
      array.push(
        ((settingsPortalContainer.ownerDocument
          .documentElement: any): HTMLElement)
      );
    }
    return array;
  }, [networkPortalContainer, rootContainer, settingsPortalContainer]);

  const computedStyle = getComputedStyle((document.body: any));
  const comfortableLineHeight = parseInt(
    computedStyle.getPropertyValue('--comfortable-line-height-data'),
    10
  );
  const compactLineHeight = parseInt(
    computedStyle.getPropertyValue('--compact-line-height-data'),
    10
  );

  useLayoutEffect(() => {
    switch (displayDensity) {
      case 'comfortable':
        updateDisplayDensity('comfortable', documentElements);
        break;
      case 'compact':
        updateDisplayDensity('compact', documentElements);
        break;
      default:
        throw Error(`Unsupported displayDensity value "${displayDensity}"`);
    }
  }, [displayDensity, documentElements]);

  useLayoutEffect(() => {
    switch (theme) {
      case 'light':
        updateThemeVariables('light', documentElements);
        break;
      case 'dark':
        updateThemeVariables('dark', documentElements);
        break;
      case 'auto':
        updateThemeVariables(browserTheme, documentElements);
        break;
      default:
        throw Error(`Unsupported theme value "${theme}"`);
    }
  }, [browserTheme, theme, documentElements]);

  const value = useMemo(
    () => ({
      displayDensity,
      setDisplayDensity,
      theme,
      setTheme,
      lineHeight:
        displayDensity === 'compact'
          ? compactLineHeight
          : comfortableLineHeight,
    }),
    [
      comfortableLineHeight,
      compactLineHeight,
      displayDensity,
      setDisplayDensity,
      setTheme,
      theme,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

function setStyleVariable(
  name: string,
  value: string,
  documentElements: DocumentElements
) {
  documentElements.forEach(documentElement =>
    documentElement.style.setProperty(name, value)
  );
}

function updateStyleHelper(
  themeKey: string,
  style: string,
  documentElements: DocumentElements
) {
  setStyleVariable(
    `--${style}`,
    `var(--${themeKey}-${style})`,
    documentElements
  );
}

function updateDisplayDensity(
  displayDensity: DisplayDensity,
  documentElements: DocumentElements
): void {
  updateStyleHelper(
    displayDensity,
    'font-size-monospace-normal',
    documentElements
  );
  updateStyleHelper(
    displayDensity,
    'font-size-monospace-large',
    documentElements
  );
  updateStyleHelper(
    displayDensity,
    'font-size-monospace-small',
    documentElements
  );
  updateStyleHelper(displayDensity, 'font-size-sans-normal', documentElements);
  updateStyleHelper(displayDensity, 'font-size-sans-large', documentElements);
  updateStyleHelper(displayDensity, 'font-size-sans-small', documentElements);
  updateStyleHelper(displayDensity, 'line-height-data', documentElements);

  // Sizes and paddings/margins are all rem-based,
  // so update the root font-size as well when the display preference changes.
  const computedStyle = getComputedStyle((document.body: any));
  const fontSize = computedStyle.getPropertyValue(
    `--${displayDensity}-root-font-size`
  );
  const root = ((document.querySelector(':root'): any): HTMLElement);
  root.style.fontSize = fontSize;
}

function updateThemeVariables(
  theme: Theme,
  documentElements: DocumentElements
): void {
  updateStyleHelper(theme, 'color-attribute-name', documentElements);
  updateStyleHelper(theme, 'color-attribute-name-inverted', documentElements);
  updateStyleHelper(theme, 'color-attribute-value', documentElements);
  updateStyleHelper(theme, 'color-attribute-value-inverted', documentElements);
  updateStyleHelper(theme, 'color-attribute-editable-value', documentElements);
  updateStyleHelper(theme, 'color-background', documentElements);
  updateStyleHelper(theme, 'color-background-hover', documentElements);
  updateStyleHelper(theme, 'color-background-hover-inactive', documentElements);
  updateStyleHelper(theme, 'color-background-inactive', documentElements);
  updateStyleHelper(theme, 'color-background-invalid', documentElements);
  updateStyleHelper(theme, 'color-background-search-bar', documentElements);
  updateStyleHelper(theme, 'color-background-selected', documentElements);
  updateStyleHelper(theme, 'color-border', documentElements);
  updateStyleHelper(theme, 'color-button-background', documentElements);
  updateStyleHelper(theme, 'color-button-background-focus', documentElements);
  updateStyleHelper(theme, 'color-button', documentElements);
  updateStyleHelper(theme, 'color-button-active', documentElements);
  updateStyleHelper(theme, 'color-button-disabled', documentElements);
  updateStyleHelper(theme, 'color-button-focus', documentElements);
  updateStyleHelper(theme, 'color-button-hover', documentElements);
  updateStyleHelper(
    theme,
    'color-commit-did-not-render-fill',
    documentElements
  );
  updateStyleHelper(
    theme,
    'color-commit-did-not-render-fill-text',
    documentElements
  );
  updateStyleHelper(
    theme,
    'color-commit-did-not-render-pattern',
    documentElements
  );
  updateStyleHelper(
    theme,
    'color-commit-did-not-render-pattern-text',
    documentElements
  );
  updateStyleHelper(theme, 'color-commit-gradient-0', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-1', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-2', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-3', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-4', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-5', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-6', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-7', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-8', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-9', documentElements);
  updateStyleHelper(theme, 'color-commit-gradient-text', documentElements);
  updateStyleHelper(theme, 'color-component-name', documentElements);
  updateStyleHelper(theme, 'color-component-name-inverted', documentElements);
  updateStyleHelper(
    theme,
    'color-component-badge-background',
    documentElements
  );
  updateStyleHelper(
    theme,
    'color-component-badge-background-inverted',
    documentElements
  );
  updateStyleHelper(theme, 'color-component-badge-count', documentElements);
  updateStyleHelper(
    theme,
    'color-component-badge-count-inverted',
    documentElements
  );
  updateStyleHelper(theme, 'color-dim', documentElements);
  updateStyleHelper(theme, 'color-dimmer', documentElements);
  updateStyleHelper(theme, 'color-dimmest', documentElements);
  updateStyleHelper(theme, 'color-expand-collapse-toggle', documentElements);
  updateStyleHelper(theme, 'color-modal-background', documentElements);
  updateStyleHelper(theme, 'color-record-active', documentElements);
  updateStyleHelper(theme, 'color-record-hover', documentElements);
  updateStyleHelper(theme, 'color-record-inactive', documentElements);
  updateStyleHelper(theme, 'color-color-scroll-thumb', documentElements);
  updateStyleHelper(theme, 'color-color-scroll-track', documentElements);
  updateStyleHelper(theme, 'color-search-bar', documentElements);
  updateStyleHelper(theme, 'color-search-match', documentElements);
  updateStyleHelper(theme, 'color-search-match-current', documentElements);
  updateStyleHelper(
    theme,
    'color-selected-tree-highlight-active',
    documentElements
  );
  updateStyleHelper(
    theme,
    'color-selected-tree-highlight-inactive',
    documentElements
  );
  updateStyleHelper(theme, 'color-tab-selected-border', documentElements);
  updateStyleHelper(theme, 'color-text', documentElements);
  updateStyleHelper(theme, 'color-text-invalid', documentElements);
  updateStyleHelper(theme, 'color-text-selected', documentElements);
  updateStyleHelper(theme, 'color-toggle-background-invalid', documentElements);
  updateStyleHelper(theme, 'color-toggle-background-on', documentElements);
  updateStyleHelper(theme, 'color-toggle-background-off', documentElements);
  updateStyleHelper(theme, 'color-toggle-text', documentElements);
  updateStyleHelper(theme, 'color-tooltip-background', documentElements);
  updateStyleHelper(theme, 'color-tooltip-text', documentElements);

  // Font smoothing varies based on the theme.
  updateStyleHelper(theme, 'font-smoothing', documentElements);

  // Update scrollbar color to match theme.
  // this CSS property is currently only supported in Firefox,
  // but it makes a significant UI improvement in dark mode.
  // https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color
  documentElements.forEach(documentElement => {
    // $FlowFixMe scrollbarColor is missing in CSSStyleDeclaration
    documentElement.style.scrollbarColor = `var(${`--${theme}-color-scroll-thumb`}) var(${`--${theme}-color-scroll-track`})`;
  });
}

export { SettingsContext, SettingsContextController };
