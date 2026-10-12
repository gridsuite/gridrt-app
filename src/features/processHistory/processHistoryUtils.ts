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
import { ProcessStatusCellRenderer } from './components/renderers/process-status-cell-renderer';
import { ProcessActionsCellRenderer } from './components/renderers/process-actions-cell-renderer';

const PROCESS_HISTORY_TABLE = 'processHistory';

export const PROCESS_HISTORY_SORT_PARAMS: SortParams = {
    table: PROCESS_HISTORY_TABLE,
    tab: PROCESS_HISTORY_TABLE,
};

export const processResultsColumnsDefinition = (intl: IntlShape): ColDef[] => {
    const sortParams = PROCESS_HISTORY_SORT_PARAMS;

    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'RawSnapshots' }),
            colId: 'caseName',
            field: 'caseName',
            minWidth: 200,
            initialFlex: 10,
            pinned: true,
            cellRendererParams: (params: any) => ({
                id: params.data.id,
            }),
            context: {
                sortParams,
            },
            valueGetter: (params) => params.data.caseName ?? params.data.caseUuid,
        }),

        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Status' }),
            colId: 'status',
            field: 'status',
            minWidth: 174,
            maxWidth: 174,
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
            minWidth: 72,
            maxWidth: 72,
            resizable: false,
            cellRenderer: ProcessActionsCellRenderer,
            cellRendererParams: (params: any) => ({
                processUuid: params.data.processUuid,
                status: params.data.status,
                caseName: params.data.caseName ?? params.data.caseUuid,
            }),
            sortable: false,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: '',
            colId: 'filler',
            minWidth: 0,
            flex: 1,
        }),
    ];
};
