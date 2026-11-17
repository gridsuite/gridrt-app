/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DARK_THEME, LIGHT_THEME } from '@gridsuite/commons-ui';
import { describe, expect, it } from 'vitest';
import { getAppTheme } from '../config/app-theme';

describe('app theme top bar backgrounds', () => {
    it('uses the light palette backgrounds', () => {
        const theme = getAppTheme(LIGHT_THEME);

        expect(theme.topBar.defaultMode.background).toBe('#f5f5f5');
        expect(theme.topBar.sandboxMode.background).toBe('rgba(156, 39, 176, 0.08)');
    });

    it('uses the dark palette backgrounds', () => {
        const theme = getAppTheme(DARK_THEME);

        expect(theme.topBar.defaultMode.background).toBe('#424242');
        expect(theme.topBar.sandboxMode.background).toBe('rgba(206, 147, 216, 0.16)');
    });
});
