/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DARK_THEME, LANG_SYSTEM } from '@gridsuite/commons-ui';
import type { Preferences } from './preferences.types';

export const DEFAULT_PREFERENCES: Preferences = {
    language: LANG_SYSTEM,
    theme: DARK_THEME,
    isDeveloperMode: false,
};
