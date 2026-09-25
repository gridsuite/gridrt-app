/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useGetAllProcessExecutionsQuery } from 'shared/api/snapshot-refiner-api';
import type { ProcessExecution } from 'shared/api/snapshot-refiner-api';
import type { ProcessExecutionInfo } from '../model/process-execution-info';

export const mapProcessInfos = (api: ProcessExecution): ProcessExecutionInfo => ({
    ...api,
    startedAt: api.startedAt ? new Date(api.startedAt) : undefined,
    completedAt: api.completedAt ? new Date(api.completedAt) : undefined,
});

export function useProcessResults() {
    const { data = [], isError, isLoading, isSuccess, refetch } = useGetAllProcessExecutionsQuery();

    const mappedData = data.map(mapProcessInfos);

    return {
        executions: mappedData,
        isEmpty: data.length === 0,
        isError,
        isLoading,
        isSuccess,
        refresh: refetch,
    };
}
