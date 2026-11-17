/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { it, expect } from 'vitest';
import messagesEn from 'shared/translations/en/common.json';
import messagesFr from 'shared/translations/fr/common.json';

it('en and fr common translations have the same keys', () => {
    const en = Object.keys(messagesEn);
    const fr = Object.keys(messagesFr);
    expect(fr.filter((key) => !en.includes(key))).toEqual([]);
    expect(en.filter((key) => !fr.includes(key))).toEqual([]);
});
