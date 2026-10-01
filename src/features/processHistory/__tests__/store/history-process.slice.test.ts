/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from 'vitest';
import { SortWay } from '@gridsuite/commons-ui';
import {
    processHistoryReducer,
    setProcessExecutionHistoryTableSort,
} from 'features/processHistory/store/history-process.slice';
import { PROCESS_HISTORY_SORT_STORE } from 'features/processHistory/store/history-process.constants';
import type { HistoryProcessState } from 'features/processHistory/store/history-process.type';

const getInitialState = (): HistoryProcessState => processHistoryReducer(undefined, { type: '@@INIT' });

describe('processHistoryReducer', () => {
    it('has the expected initial state', () => {
        const state = getInitialState();

        expect(state.tables).toEqual({ uuid: null });
        expect(state.tableSort[PROCESS_HISTORY_SORT_STORE][PROCESS_HISTORY_SORT_STORE]).toEqual([
            { colId: 'startedAt', sort: SortWay.DESC },
        ]);
    });

    it('updates the sorts for an existing table/tab', () => {
        const newSorts = [{ colId: 'completedAt', sort: SortWay.ASC }];

        const state = processHistoryReducer(
            getInitialState(),
            setProcessExecutionHistoryTableSort({
                table: PROCESS_HISTORY_SORT_STORE,
                tab: PROCESS_HISTORY_SORT_STORE,
                sorts: newSorts,
            })
        );

        expect(state.tableSort[PROCESS_HISTORY_SORT_STORE][PROCESS_HISTORY_SORT_STORE]).toEqual(newSorts);
    });

    it('lazily creates the table entry when it does not exist yet', () => {
        const newSorts = [{ colId: 'status', sort: SortWay.ASC }];

        const state = processHistoryReducer(
            getInitialState(),
            setProcessExecutionHistoryTableSort({
                table: 'unknownTable',
                tab: 'someTab',
                sorts: newSorts,
            })
        );

        expect(state.tableSort.unknownTable).toBeDefined();
        expect(state.tableSort.unknownTable.someTab).toEqual(newSorts);
    });
});
