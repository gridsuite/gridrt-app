/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import {
    CustomAggridSortContext,
    type CustomAggridSortContextValue,
    SortConfig,
    SortParams,
    SortWay,
} from '@gridsuite/commons-ui';

const DEFAULT_PROCESS_HISTORY_SORT: SortConfig[] = [{ colId: 'startedAt', sort: SortWay.DESC }];

/**
 * The commons-ui custom header needs a sort context. The process history only has one table, so its sort is kept
 * in local state: it lives as long as the page is mounted.
 */
export function ProcessHistorySortProvider({ children }: Readonly<PropsWithChildren>) {
    const [sortConfig, setSortConfig] = useState<SortConfig[]>(DEFAULT_PROCESS_HISTORY_SORT);

    const getSortConfig = useCallback(
        (sortParams: SortParams | undefined) => (sortParams ? sortConfig : undefined),
        [sortConfig]
    );

    const updateSortConfig = useCallback((_sortParams: SortParams, updatedSortConfig: SortConfig[]) => {
        setSortConfig(updatedSortConfig);
    }, []);

    const value: CustomAggridSortContextValue = useMemo(
        () => ({ getSortConfig, setSortConfig: updateSortConfig }),
        [getSortConfig, updateSortConfig]
    );

    return <CustomAggridSortContext.Provider value={value}>{children}</CustomAggridSortContext.Provider>;
}
