/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from 'vitest';
import type { IntlShape } from 'react-intl';
import { processResultsColumnsDefinition } from 'features/processHistory/processHistoryUtils';

const intlMock = {
    formatMessage: ({ id }: { id: string }) => id,
} as unknown as IntlShape;

describe('processResultsColumnsDefinition', () => {
    it('returns the expected columns in order', () => {
        const columns = processResultsColumnsDefinition(intlMock);

        expect(columns.map((col) => col.colId)).toEqual([
            'caseName',
            'status',
            'startedAt',
            'completedAt',
            'actions',
            'filler',
        ]);
    });

    it('resolves header names through intl', () => {
        const columns = processResultsColumnsDefinition(intlMock);
        const byColId = (colId: string) => columns.find((col) => col.colId === colId);

        expect(byColId('caseName')?.headerName).toBe('RawSnapshots');
        expect(byColId('status')?.headerName).toBe('Status');
        expect(byColId('startedAt')?.headerName).toBe('StartedAt');
        expect(byColId('completedAt')?.headerName).toBe('CompletedAt');
        expect(byColId('actions')?.headerName).toBe('Actions');
    });

    it('falls back to caseUuid when caseName is missing in the valueGetter', () => {
        const columns = processResultsColumnsDefinition(intlMock);
        const caseNameCol = columns.find((col) => col.colId === 'caseName');
        const valueGetter = caseNameCol?.valueGetter as (params: any) => unknown;

        expect(valueGetter({ data: { caseName: 'A name', caseUuid: 'uuid-1' } })).toBe('A name');
        expect(valueGetter({ data: { caseUuid: 'uuid-1' } })).toBe('uuid-1');
    });
});
