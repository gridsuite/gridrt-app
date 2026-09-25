/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TableSortConfig } from '@gridsuite/commons-ui';
import { UUID } from 'node:crypto';
import { PROCESS_HISTORY_SORT_STORE } from './history-process.constants';

export type TableSort = {
    [PROCESS_HISTORY_SORT_STORE]: TableSortConfig;
};

interface TablesState {
    uuid: UUID | null;
}
export interface HistoryProcessState {
    tableSort: TableSort;
    tables: TablesState;
}
