/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useAppDispatch } from '../store/store';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { invalidateAllQueries as invalidateAllConfigQueries } from '../../shared/api/config-api';
import { invalidateAllQueries as invalidateAllSnapshotRefinerQueries } from '../../shared/api/snapshot-refiner-api';

/**
 * On WebSocket reconnection, invalidate only tagged RTK queries associated
 * with that WebSocket (config or snapshot-refiner), as backend notifications may have been missed.
 * Untagged queries are excluded since they don't rely on WebSocket notifications.
 * Update this mapping if a new WebSocket URL is added.
 */
export const useGlobalInvalidationListener = () => {
    const dispatch = useAppDispatch();

    useNotificationsListener(NotificationsUrlKeys.CONFIG, {
        listenerCallbackOnReopen: () => invalidateAllConfigQueries(dispatch),
    });

    useNotificationsListener(NotificationsUrlKeys.RT, {
        listenerCallbackOnReopen: () => invalidateAllSnapshotRefinerQueries(dispatch),
    });
};
