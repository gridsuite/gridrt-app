/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { parseError, snackWithFallback } from '@gridsuite/commons-ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { snackRef } from 'shared/lib/snack-ref';
import { errorMiddleware } from './rtk-query-error-middleware';

vi.mock('@gridsuite/commons-ui', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@gridsuite/commons-ui')>()),
    snackWithFallback: vi.fn(),
}));

vi.mock('shared/lib/snack-ref', () => ({
    snackRef: {
        error: vi.fn(),
    },
}));

const createRejectedAction = (payload: unknown, endpointName = 'runSnapshotRefiner') => ({
    type: 'api/executeMutation/rejected',
    payload,
    error: { message: 'Rejected' },
    meta: {
        requestId: 'test-request-id',
        requestStatus: 'rejected',
        rejectedWithValue: true,
        arg: {
            type: 'mutation',
            endpointName,
        },
    },
});

describe('errorMiddleware', () => {
    const next = vi.fn();
    const middleware = errorMiddleware({} as Parameters<Middleware>[0])(next);

    const dispatch = (action: UnknownAction) => middleware(action);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('forwards regular actions without displaying a notification', () => {
        const action = { type: 'test/action' };

        dispatch(action);

        expect(next).toHaveBeenCalledWith(action);
        expect(snackRef.error).not.toHaveBeenCalled();
        expect(snackWithFallback).not.toHaveBeenCalled();
    });

    it('parses structured problem details and displays them with the shared fallback', () => {
        const payload = {
            status: 400,
            data: {
                status: 400,
                detail: 'Only the OpenLoadFlow provider is supported.',
                server: 'snapshot-refiner-server',
                timestamp: '2026-11-26T10:00:00Z',
                traceId: 'trace-123',
                businessErrorCode: 'snapshotRefiner.server.unsupportedProvider',
                businessErrorValues: {},
            },
        };
        const action = createRejectedAction(payload);

        dispatch(action);

        expect(snackWithFallback).toHaveBeenCalledWith(snackRef.error, parseError(JSON.stringify(payload.data)));
        expect(snackRef.error).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(action);
    });

    it('uses the endpoint fallback for errors without a data payload', () => {
        const action = createRejectedAction({
            status: 'FETCH_ERROR',
            message: 'Network error',
        });

        dispatch(action);

        expect(snackRef.error).toHaveBeenCalledWith({
            headerId: 'runSnapshotRefiner',
            messageTxt: 'Network error',
        });
        expect(snackWithFallback).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(action);
    });
});
