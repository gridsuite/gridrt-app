/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useNotificationsListener } from '@gridsuite/commons-ui';
import {
    invalidateProcessExecution,
    invalidateProcessExecutionsLists,
    isProcessExecutionUpdateNotification,
} from 'shared/api/snapshot-refiner-api';
import { RT_NOTIFICATION_URL_KEY } from 'shared/api/ws/use-notifications-url-generator';

import { useAppDispatch } from '../store/store';

export const useProcessInvalidationsListener = () => {
    const dispatch = useAppDispatch();

    const invalidateProcess = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);
            if (isProcessExecutionUpdateNotification(eventData)) {
                invalidateProcessExecutionsLists(dispatch);
                if (eventData.headers?.executionId) {
                    invalidateProcessExecution(dispatch, eventData.headers.executionId);
                }
            }
        },
        [dispatch]
    );

    const invalidateProcessesOnReopen = useCallback(() => invalidateProcessExecutionsLists(dispatch), [dispatch]);

    useNotificationsListener(RT_NOTIFICATION_URL_KEY, {
        listenerCallbackMessage: invalidateProcess,
        listenerCallbackOnReopen: invalidateProcessesOnReopen,
    });
};
