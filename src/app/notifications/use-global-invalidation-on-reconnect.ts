/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { useAppDispatch } from '../store/store';
import { invalidateAllConfigQueries } from '../../shared/api/config-api';
import { invalidateAllSnapshotRefinerQueries } from '../../shared/api/snapshot-refiner-api';

/**
 * On WebSocket reconnection, invalidate only tagged RTK queries associated
 * with that WebSocket (config or snapshot-refiner), as backend notifications may have been missed.
 * Untagged queries are excluded since they don't rely on WebSocket notifications.
 * Update this mapping if a new WebSocket URL is added.
 */
export const useGlobalInvalidationListener = () => {
    const dispatch = useAppDispatch();
    const [disconnectedChannels, setDisconnectedChannels] = useState<Set<NotificationsUrlKeys>>(() => new Set());

    const refreshAllTaggedQueries = useCallback(() => {
        invalidateAllConfigQueries(dispatch);
        invalidateAllSnapshotRefinerQueries(dispatch);
    }, [dispatch]);

    const setChannelDisconnected = (channel: NotificationsUrlKeys, disconnected: boolean) => {
        setDisconnectedChannels((previous) => {
            if (previous.has(channel) === disconnected) {
                return previous;
            }
            const next = new Set(previous);
            if (disconnected) {
                next.add(channel);
            } else {
                next.delete(channel);
            }
            return next;
        });
    };

    useNotificationsListener(NotificationsUrlKeys.CONFIG, {
        listenerCallbackOnClose: () => setChannelDisconnected(NotificationsUrlKeys.CONFIG, true),
        listenerCallbackOnReopen: () => {
            setChannelDisconnected(NotificationsUrlKeys.CONFIG, false);
            invalidateAllConfigQueries(dispatch);
        },
    });

    useNotificationsListener(NotificationsUrlKeys.RT, {
        listenerCallbackOnClose: () => setChannelDisconnected(NotificationsUrlKeys.RT, true),
        listenerCallbackOnReopen: () => {
            setChannelDisconnected(NotificationsUrlKeys.RT, false);
            invalidateAllSnapshotRefinerQueries(dispatch);
        },
    });

    return {
        isDisconnected: disconnectedChannels.size > 0,
        disconnectedChannels: Array.from(disconnectedChannels),
        refreshAllTaggedQueries,
    };
};
