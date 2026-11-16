/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { snapshotRefinerGeneratedApi } from './snapshot-refiner.generated';
import { SnapshotRefinerTags } from './snapshot-refiner-base-api';
import type { AppDispatch } from '../../../app/store/store';

export const snapshotRefinerApi = snapshotRefinerGeneratedApi.enhanceEndpoints({
    endpoints: {
        getAllProcessExecutions: {
            providesTags: [{ type: SnapshotRefinerTags.ProcessExecutions, id: 'LIST' }],
        },
        getProcessExecution: {
            providesTags: (_result, _error, queryArg) => [
                { type: SnapshotRefinerTags.ProcessExecution, id: queryArg.processUuid },
            ],
        },
    },
});

export const invalidateProcessExecutionsLists = (dispatch: AppDispatch) =>
    dispatch(snapshotRefinerApi.util.invalidateTags([{ type: SnapshotRefinerTags.ProcessExecutions, id: 'LIST' }]));

export const invalidateProcessExecution = (dispatch: AppDispatch, executionId: string) =>
    dispatch(snapshotRefinerApi.util.invalidateTags([{ type: SnapshotRefinerTags.ProcessExecution, id: executionId }]));
