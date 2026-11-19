/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act, renderHook } from '@testing-library/react';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestContext } from 'test-utils/create-test-context';
import { invalidateAllConfigQueries } from '../../../shared/api/config-api';
import { invalidateAllSnapshotRefinerQueries } from '../../../shared/api/snapshot-refiner-api';
import { useGlobalInvalidationListener } from '../../notifications/use-global-invalidation-on-reconnect';

vi.mock('../../../shared/api/config-api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../shared/api/config-api')>();
    return { ...actual, invalidateAllConfigQueries: vi.fn() };
});

vi.mock('../../../shared/api/snapshot-refiner-api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../shared/api/snapshot-refiner-api')>();
    return { ...actual, invalidateAllSnapshotRefinerQueries: vi.fn() };
});

vi.mock('@gridsuite/commons-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gridsuite/commons-ui')>();
    return { ...actual, useNotificationsListener: vi.fn() };
});

type Callbacks = Partial<Record<string, () => void>>;

const CHANNELS = [
    {
        urlKey: NotificationsUrlKeys.CONFIG,
        expectedInvalidator: invalidateAllConfigQueries,
        unrelatedInvalidator: invalidateAllSnapshotRefinerQueries,
    },
    {
        urlKey: NotificationsUrlKeys.RT,
        expectedInvalidator: invalidateAllSnapshotRefinerQueries,
        unrelatedInvalidator: invalidateAllConfigQueries,
    },
] as const;

describe('useGlobalInvalidationListener', () => {
    let onCloseByUrlKey: Callbacks;
    let onReopenByUrlKey: Callbacks;

    const trigger = (callbacks: Callbacks, urlKey: NotificationsUrlKeys) => {
        const callback = callbacks[urlKey];
        if (!callback) {
            throw new Error(`No listener registered for ${urlKey}`);
        }
        act(() => callback());
    };
    const close = (urlKey: NotificationsUrlKeys) => trigger(onCloseByUrlKey, urlKey);
    const reopen = (urlKey: NotificationsUrlKeys) => trigger(onReopenByUrlKey, urlKey);

    const renderListener = () => {
        const { wrapper, store } = createTestContext();
        const hook = renderHook(() => useGlobalInvalidationListener(), { wrapper });
        return { ...hook, store };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        onCloseByUrlKey = {};
        onReopenByUrlKey = {};

        vi.mocked(useNotificationsListener).mockImplementation((urlKey, options) => {
            onCloseByUrlKey[urlKey] = options.listenerCallbackOnClose;
            onReopenByUrlKey[urlKey] = options.listenerCallbackOnReopen;
        });
    });

    it('registers close and reopen listeners on CONFIG and RT without invalidating anything', () => {
        const { result } = renderListener();

        [NotificationsUrlKeys.CONFIG, NotificationsUrlKeys.RT].forEach((urlKey) => {
            expect(useNotificationsListener).toHaveBeenCalledWith(urlKey, {
                listenerCallbackOnClose: expect.any(Function),
                listenerCallbackOnReopen: expect.any(Function),
            });
        });
        expect(result.current.isDisconnected).toBe(false);
        expect(result.current.disconnectedChannels).toEqual([]);
        expect(invalidateAllConfigQueries).not.toHaveBeenCalled();
        expect(invalidateAllSnapshotRefinerQueries).not.toHaveBeenCalled();
    });

    it.each(CHANNELS)('marks only $urlKey as disconnected when its websocket closes', ({ urlKey }) => {
        const { result } = renderListener();

        close(urlKey);

        expect(result.current.isDisconnected).toBe(true);
        expect(result.current.disconnectedChannels).toEqual([urlKey]);
    });

    it.each(CHANNELS)(
        'clears $urlKey and invalidates only its queries when its websocket reopens',
        ({ urlKey, expectedInvalidator, unrelatedInvalidator }) => {
            const { result, store } = renderListener();

            close(urlKey);
            reopen(urlKey);

            expect(result.current.isDisconnected).toBe(false);
            expect(result.current.disconnectedChannels).toEqual([]);
            expect(expectedInvalidator).toHaveBeenCalledTimes(1);
            expect(expectedInvalidator).toHaveBeenCalledWith(store.dispatch);
            expect(unrelatedInvalidator).not.toHaveBeenCalled();
        }
    );

    it('stays disconnected while another websocket is still down', () => {
        const { result } = renderListener();

        close(NotificationsUrlKeys.CONFIG);
        close(NotificationsUrlKeys.RT);
        reopen(NotificationsUrlKeys.CONFIG);

        expect(result.current.isDisconnected).toBe(true);
        expect(result.current.disconnectedChannels).toEqual([NotificationsUrlKeys.RT]);

        reopen(NotificationsUrlKeys.RT);

        expect(result.current.isDisconnected).toBe(false);
        expect(result.current.disconnectedChannels).toEqual([]);
    });

    it('lists a channel only once when it closes several times', () => {
        const { result } = renderListener();

        close(NotificationsUrlKeys.CONFIG);
        close(NotificationsUrlKeys.CONFIG);

        expect(result.current.disconnectedChannels).toEqual([NotificationsUrlKeys.CONFIG]);
    });

    it('invalidates all tagged queries on manual refresh without changing the connection state', () => {
        const { result, store } = renderListener();

        close(NotificationsUrlKeys.RT);
        act(() => result.current.refreshAllTaggedQueries());

        expect(invalidateAllConfigQueries).toHaveBeenCalledExactlyOnceWith(store.dispatch);
        expect(invalidateAllSnapshotRefinerQueries).toHaveBeenCalledExactlyOnceWith(store.dispatch);
        expect(result.current.disconnectedChannels).toEqual([NotificationsUrlKeys.RT]);
    });
});
