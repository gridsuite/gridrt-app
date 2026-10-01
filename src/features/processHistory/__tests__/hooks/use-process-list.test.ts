/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from 'vitest';
import { Status, type ProcessExecution } from 'shared/api/snapshot-refiner-api';
import { mapProcessInfos } from 'features/processHistory/hooks/use-process-list';

describe('mapProcessInfos', () => {
    it('converts startedAt and completedAt to Date instances', () => {
        const api: ProcessExecution = {
            startedAt: '2026-01-01T10:00:00Z',
            completedAt: '2026-01-01T11:30:00Z',
        };

        const result = mapProcessInfos(api);

        expect(result.startedAt).toBeInstanceOf(Date);
        expect(result.completedAt).toBeInstanceOf(Date);
        expect(result.startedAt?.toISOString()).toBe(new Date('2026-01-01T10:00:00Z').toISOString());
        expect(result.completedAt?.toISOString()).toBe(new Date('2026-01-01T11:30:00Z').toISOString());
    });

    it('returns undefined dates when startedAt/completedAt are missing', () => {
        const result = mapProcessInfos({});

        expect(result.startedAt).toBeUndefined();
        expect(result.completedAt).toBeUndefined();
    });

    it('keeps undefined for completedAt while still mapping startedAt', () => {
        const result = mapProcessInfos({ startedAt: '2026-01-01T10:00:00Z' });

        expect(result.startedAt).toBeInstanceOf(Date);
        expect(result.completedAt).toBeUndefined();
    });

    it('passes other fields through unchanged', () => {
        const api: ProcessExecution = {
            processUuid: 'process-1',
            caseUuid: 'case-1',
            caseName: 'My case',
            status: Status.Completed,
            userId: 'user-1',
        };

        const result = mapProcessInfos(api);

        expect(result.processUuid).toBe('process-1');
        expect(result.caseUuid).toBe('case-1');
        expect(result.caseName).toBe('My case');
        expect(result.status).toBe(Status.Completed);
        expect(result.userId).toBe('user-1');
    });
});
