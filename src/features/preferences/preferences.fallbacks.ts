/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getLocalStorageLanguage, getLocalStorageTheme } from 'features/preferences/preferences.storage';
import { Preferences } from 'features/preferences/preferences.types';
import { DEFAULT_PREFERENCES } from './preferences.defaults';

export function readPreferenceFallbacks(): Preferences {
    return {
        language: getLocalStorageLanguage(),
        theme: getLocalStorageTheme(),
        isDeveloperMode: DEFAULT_PREFERENCES.isDeveloperMode,
    };
}
