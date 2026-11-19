/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { renderHook } from '@testing-library/react';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invalidateAllQueries as invalidateAllConfigQueries } from '../../../shared/api/config-api';
import { invalidateAllQueries as invalidateAllSnapshotRefinerQueries } from '../../../shared/api/snapshot-refiner-api';
import { createTestContext } from 'test-utils/create-test-context';
import { useGlobalInvalidationListener } from '../../notifications/use-global-invalidation-on-reconnect';

vi.mock('../../../shared/api/config-api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../shared/api/config-api')>();

    return { ...actual, invalidateAllQueries: vi.fn() };
});

vi.mock('../../../shared/api/snapshot-refiner-api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../shared/api/snapshot-refiner-api')>();

    return { ...actual, invalidateAllQueries: vi.fn() };
});
vi.mock('@gridsuite/commons-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gridsuite/commons-ui')>();

    return {
        ...actual,
        useNotificationsListener: vi.fn(),
    };
});

describe('useGlobalInvalidationListener', () => {
    let onReopenByUrlKey: Record<string, (() => void) | undefined>;

    beforeEach(() => {
        vi.clearAllMocks();
        onReopenByUrlKey = {};

        vi.mocked(useNotificationsListener).mockImplementation((urlKey, options) => {
            onReopenByUrlKey[urlKey] = options.listenerCallbackOnReopen;
        });
    });

    it('registers reopen listeners on the config and RT channels', () => {
        const { wrapper } = createTestContext();

        renderHook(() => useGlobalInvalidationListener(), { wrapper });

        expect(useNotificationsListener).toHaveBeenCalledTimes(2);
        expect(useNotificationsListener).toHaveBeenCalledWith(NotificationsUrlKeys.CONFIG, {
            listenerCallbackOnReopen: expect.any(Function),
        });
        expect(useNotificationsListener).toHaveBeenCalledWith(NotificationsUrlKeys.RT, {
            listenerCallbackOnReopen: expect.any(Function),
        });
    });

    it('does not invalidate anything before a reopen happens', () => {
        const { wrapper } = createTestContext();

        renderHook(() => useGlobalInvalidationListener(), { wrapper });

        expect(invalidateAllConfigQueries).not.toHaveBeenCalled();
        expect(invalidateAllSnapshotRefinerQueries).not.toHaveBeenCalled();
    });

    it.each([
        [NotificationsUrlKeys.CONFIG, invalidateAllConfigQueries, invalidateAllSnapshotRefinerQueries],
        [NotificationsUrlKeys.RT, invalidateAllSnapshotRefinerQueries, invalidateAllConfigQueries],
    ] as const)(
        'invalidates all queries when the %s websocket reopens',
        (urlKey, expectedInvalidator, unrelatedInvalidator) => {
            const { wrapper } = createTestContext();

            renderHook(() => useGlobalInvalidationListener(), { wrapper });

            onReopenByUrlKey[urlKey]?.();

            expect(expectedInvalidator).toHaveBeenCalledTimes(1);
            expect(unrelatedInvalidator).not.toHaveBeenCalled();
        }
    );
});
