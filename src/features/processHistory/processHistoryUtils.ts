/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { makeAgGridCustomHeaderColumn, SortParams } from '@gridsuite/commons-ui';
import { ColDef } from 'ag-grid-community';
import { IntlShape } from 'react-intl';
import { ProcessDateCellRenderer } from './components/renderers/process-date-cell-renderer';
import { PROCESS_HISTORY_SORT_STORE } from './store/history-process.constants';
import { ProcessStatusCellRenderer } from './components/renderers/process-status-cell-renderer';
import { ProcessActionsCellRenderer } from './components/renderers/process-actions-cell-renderer';

interface TableParams {
    sortParams: SortParams;
}

const createTableParams = (): TableParams => {
    return {
        sortParams: {
            table: PROCESS_HISTORY_SORT_STORE,
            tab: PROCESS_HISTORY_SORT_STORE,
        },
    };
};

export const processResultsColumnsDefinition = (
    intl: IntlShape,
    getEnumLabel: (value: string) => string // Used for translation of enum values in the filter
): ColDef[] => {
    const { sortParams } = createTableParams();

    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'RawSnapshots' }),
            colId: 'caseUuid',
            field: 'caseUuid',
            minWidth: 220,
            resizable: true,
            cellRendererParams: (params: any) => ({
                id: params.data.id,
            }),
            context: {
                sortParams,
            },
            valueGetter: (params) => params.data.caseUuid,
        }),

        // Process started at
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Status' }),
            colId: 'status',
            field: 'status',
            minWidth: 183,
            maxWidth: 183,
            resizable: false,
            cellRenderer: ProcessStatusCellRenderer,
            cellRendererParams: (params: any) => ({
                id: params.data.id,
            }),
            context: {
                sortParams,
            },
            valueGetter: (params) => params.data.status,
        }),

        // Process completed at
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'StartedAt' }),
            colId: 'startedAt',
            field: 'startedAt',
            minWidth: 183,
            maxWidth: 183,
            resizable: false,
            cellRenderer: ProcessDateCellRenderer,
            cellRendererParams: (params: any) => ({
                id: params.data.id,
            }),
            context: {
                sortParams,
            },
            valueGetter: (params) => params.data.startedAt,
        }),

        // Process details
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CompletedAt' }),
            colId: 'completedAt',
            field: 'completedAt',
            minWidth: 183,
            maxWidth: 183,
            resizable: false,
            cellRenderer: ProcessDateCellRenderer,
            cellRendererParams: (params: any) => ({
                id: params.data.id,
            }),
            context: {
                sortParams,
            },
            valueGetter: (params) => params.data.completedAt,
        }),

        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Actions' }),
            colId: 'actions',
            field: 'actions',
            minWidth: 90,
            maxWidth: 90,
            resizable: false,
            cellRenderer: ProcessActionsCellRenderer,
            cellRendererParams: (params: any) => ({
                id: params.data.id,
                status: params.data.status,
                steps: params.data.executionSteps,
            }),
            sortable: false,
        }),
    ];
};
