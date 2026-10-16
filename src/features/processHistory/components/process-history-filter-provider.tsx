/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import {
    CustomAggridFilterContext,
    type CustomAggridFilterContextValue,
    FilterConfig,
    FilterParams,
} from '@gridsuite/commons-ui';

/**
 * The commons-ui custom filters need a filter context. The process history only has one table, so its filters are
 * kept in local state: they live as long as the page is mounted.
 */
export function ProcessHistoryFilterProvider({ children }: Readonly<PropsWithChildren>) {
    const [filters, setFilters] = useState<FilterConfig[]>([]);

    const getFilters = useCallback((_params: Pick<FilterParams, 'type' | 'tab'>) => filters, [filters]);

    const updateFilter = useCallback((_colId: string, _filterParams: FilterParams, updatedFilters: FilterConfig[]) => {
        setFilters(updatedFilters);
    }, []);

    const value: CustomAggridFilterContextValue = useMemo(
        () => ({ getFilters, updateFilter }),
        [getFilters, updateFilter]
    );

    return <CustomAggridFilterContext.Provider value={value}>{children}</CustomAggridFilterContext.Provider>;
}
