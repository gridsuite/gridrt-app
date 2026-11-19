/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import {
    invalidateProcessExecution,
    invalidateProcessExecutionsLists,
    isProcessExecutionUpdateNotification,
} from 'shared/api/snapshot-refiner-api';

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

    useNotificationsListener(NotificationsUrlKeys.RT, {
        listenerCallbackMessage: invalidateProcess,
    });
};
