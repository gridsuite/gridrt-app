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
const getEnumLabelMock = (value: string) => value;

describe('processResultsColumnsDefinition', () => {
    it('returns the expected columns in order', () => {
        const columns = processResultsColumnsDefinition(intlMock, getEnumLabelMock);

        expect(columns.map((col) => col.colId)).toEqual(['caseName', 'status', 'startedAt', 'completedAt', 'actions']);
    });

    it('resolves header names through intl', () => {
        const columns = processResultsColumnsDefinition(intlMock, getEnumLabelMock);
        const byColId = (colId: string) => columns.find((col) => col.colId === colId);

        expect(byColId('caseName')?.headerName).toBe('RawSnapshots');
        expect(byColId('status')?.headerName).toBe('Status');
        expect(byColId('startedAt')?.headerName).toBe('StartedAt');
        expect(byColId('completedAt')?.headerName).toBe('CompletedAt');
        expect(byColId('actions')?.headerName).toBe('Actions');
    });

    it('lets only the first, not pinned, column fill the remaining width and be resized', () => {
        const columns = processResultsColumnsDefinition(intlMock, getEnumLabelMock);

        expect(columns[0].pinned).toBeUndefined();
        expect(columns[0].flex).toBe(1);
        expect(columns[0].resizable).toBe(true);
        columns.slice(1).forEach((col) => expect(col.flex).toBeUndefined());
        // the other columns keep the table default (not resizable)
        columns.slice(1).forEach((col) => expect(col.resizable).toBeUndefined());
    });

    it('sorts and filters the case name and status columns, only sorts the date columns', () => {
        const columns = processResultsColumnsDefinition(intlMock, getEnumLabelMock);
        const contextOf = (colId: string) => columns.find((col) => col.colId === colId)?.context;

        ['caseName', 'status'].forEach((colId) => {
            expect(contextOf(colId)?.sortParams).toBeDefined();
            expect(contextOf(colId)?.filterComponent).toBeDefined();
        });
        ['startedAt', 'completedAt'].forEach((colId) => {
            expect(contextOf(colId)?.sortParams).toBeDefined();
            expect(contextOf(colId)?.filterComponent).toBeUndefined();
        });
        expect(contextOf('actions')?.sortParams).toBeUndefined();
        expect(contextOf('actions')?.filterComponent).toBeUndefined();
    });

    it('falls back to caseUuid when caseName is missing in the valueGetter', () => {
        const columns = processResultsColumnsDefinition(intlMock, getEnumLabelMock);
        const caseNameCol = columns.find((col) => col.colId === 'caseName');
        const valueGetter = caseNameCol?.valueGetter as (params: any) => unknown;

        expect(valueGetter({ data: { caseName: 'A name', caseUuid: 'uuid-1' } })).toBe('A name');
        expect(valueGetter({ data: { caseUuid: 'uuid-1' } })).toBe('uuid-1');
    });
});
