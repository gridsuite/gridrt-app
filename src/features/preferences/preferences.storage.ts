/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GsLang, GsTheme } from '@gridsuite/commons-ui';
import { APP_NAME } from 'shared/config/application';
import { DEFAULT_PREFERENCES } from './preferences.defaults';

export const LOCAL_STORAGE_THEME_KEY = `${APP_NAME}_THEME`.toUpperCase();
const LOCAL_STORAGE_LANGUAGE_KEY = `${APP_NAME}_LANGUAGE`.toUpperCase();

export function getLocalStorageTheme() {
    return (localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as GsTheme) || DEFAULT_PREFERENCES.theme;
}

export function saveLocalStorageTheme(theme: GsTheme): void {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
}

export function getLocalStorageLanguage() {
    return (localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as GsLang) || DEFAULT_PREFERENCES.language;
}

export function saveLocalStorageLanguage(language: GsLang): void {
    localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, language);
}
