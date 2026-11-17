/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from 'vitest';
import messagesEn from 'shared/translations/en/common.json';
import messagesFr from 'shared/translations/fr/common.json';
import { appMessages } from '../config/app-messages';
import { Status } from '../../shared/api/snapshot-refiner-api';

// every source file as raw text (tests and generated api excluded)
const sources = import.meta.glob<string>(
    ['/src/**/*.{ts,tsx}', '!/src/**/__tests__/**', '!/src/**/*.test.{ts,tsx}', '!/src/**/*.generated.ts'],
    { query: '?raw', import: 'default', eager: true }
);

const ID_PATTERNS = [
    /formatMessage\(\s*\{\s*id:\s*['"`]([^'"`$]+)['"`]/g, // intl.formatMessage({ id: 'x' })
    /<FormattedMessage[^>]*?\sid=\{?\s*['"`]([^'"`$]+)['"`]/g, // <FormattedMessage id="x" />
    /\blabelId:\s*['"`]([^'"`$]+)['"`]/g, // { labelId: 'x' }
];

// ids computed at runtime, which cannot be found by the patterns above
const DYNAMIC_IDS: string[] = [...Object.values(Status)];

function extractUsedIds() {
    const used = new Map<string, Set<string>>(); // id -> files using it
    Object.entries(sources).forEach(([file, content]) => {
        ID_PATTERNS.forEach((pattern) => {
            Array.from(content.matchAll(pattern), ([, id]) => id).forEach((id) => {
                if (!used.has(id)) {
                    used.set(id, new Set());
                }
                used.get(id)!.add(file);
            });
        });
    });
    DYNAMIC_IDS.forEach((id) => used.set(id, used.get(id) ?? new Set(['<dynamic>'])));
    return used;
}

describe('translations', () => {
    const usedIds = extractUsedIds();

    it('finds message ids in the sources', () => {
        // protects against a broken glob or pattern making the next tests pass silently
        expect(usedIds.size).toBeGreaterThan(0);
    });

    it.each(['en', 'fr'] as const)('every message id used in the sources is translated in %s', (lang) => {
        const messages = appMessages[lang] ?? {};
        const missing = [...usedIds.entries()]
            .filter(([id]) => !(id in messages))
            .map(([id, files]) => `${id} (${[...files].join(', ')})`);
        expect(missing).toEqual([]);
    });

    it('en and fr common translations have the same keys', () => {
        const en = Object.keys(messagesEn);
        const fr = Object.keys(messagesFr);
        expect(fr.filter((key) => !en.includes(key))).toEqual([]);
        expect(en.filter((key) => !fr.includes(key))).toEqual([]);
    });
});
