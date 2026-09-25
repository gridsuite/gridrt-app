/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { PropsWithChildren, useCallback, useMemo } from 'react';
import {
    CustomAggridSortContext,
    type CustomAggridSortContextValue,
    SortConfig,
    SortParams,
} from '@gridsuite/commons-ui';
import { useAppDispatch, useAppSelector } from 'app/store/store';
import { setProcessExecutionHistoryTableSort } from '../store/history-process.slice';

function CustomAggridSortReduxProvider({ children }: Readonly<PropsWithChildren>) {
    const dispatch = useAppDispatch();

    const tableSort = useAppSelector((state) => {
        console.info(state);
        return state.processHistory.tableSort;
    });

    const getSortConfig = useCallback(
        (sortParams: SortParams | undefined): SortConfig[] | undefined => {
            if (!sortParams) {
                return undefined;
            }
            return tableSort[sortParams.table]?.[sortParams.tab];
        },
        [tableSort]
    );

    const setSortConfig = useCallback(
        (sortParams: SortParams, updatedSortConfig: SortConfig[]) => {
            dispatch(
                setProcessExecutionHistoryTableSort({
                    table: sortParams.table,
                    tab: sortParams.tab,
                    sorts: updatedSortConfig,
                })
            );
        },
        [dispatch]
    );

    const value: CustomAggridSortContextValue = useMemo(
        () => ({ getSortConfig, setSortConfig }),
        [getSortConfig, setSortConfig]
    );

    return <CustomAggridSortContext.Provider value={value}>{children}</CustomAggridSortContext.Provider>;
}

export function CustomAggridReduxProvider({ children }: Readonly<PropsWithChildren>) {
    return <CustomAggridSortReduxProvider>{children}</CustomAggridSortReduxProvider>;
}
