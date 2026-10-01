/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortConfig, SortWay, TableSortConfig } from '@gridsuite/commons-ui';
import { PROCESS_HISTORY_SORT_STORE } from './history-process.constants';
import { HistoryProcessState } from './history-process.type';

type SetProcessExecutionHistoryTableSortPayload = {
    table: string;
    tab: string;
    sorts: SortConfig[];
};

const initialSortState: TableSortConfig = {
    [PROCESS_HISTORY_SORT_STORE]: [{ colId: 'startedAt', sort: SortWay.DESC }],
};

const initialState: HistoryProcessState = {
    tableSort: {
        [PROCESS_HISTORY_SORT_STORE]: {
            ...initialSortState,
        },
    },
    tables: { uuid: null },
};

const processHistorySlice = createSlice({
    name: 'processHistory',
    initialState,
    reducers: {
        setProcessExecutionHistoryTableSort: (
            state,
            action: PayloadAction<SetProcessExecutionHistoryTableSortPayload>
        ) => {
            const { table, tab, sorts } = action.payload;
            state.tableSort[table] ??= {};
            state.tableSort[table][tab] = sorts;
        },
    },
});

export const { setProcessExecutionHistoryTableSort } = processHistorySlice.actions;
export const processHistoryReducer = processHistorySlice.reducer;
