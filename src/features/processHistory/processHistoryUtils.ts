/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    CustomAggridAutocompleteFilter,
    CustomAggridAutocompleteFilterParams,
    CustomAggridComparatorFilter,
    FilterDataTypes,
    FilterParams,
    FilterTextComparators,
    makeAgGridCustomHeaderColumn,
    SortParams,
    TableType,
} from '@gridsuite/commons-ui';
import { ColDef, IFilterOptionDef, ValueFormatterParams } from 'ag-grid-community';
import { IntlShape } from 'react-intl';
import { ProcessDateCellRenderer } from './components/renderers/process-date-cell-renderer';
import { ProcessStatusCellRenderer } from './components/renderers/process-status-cell-renderer';
import { ProcessActionsCellRenderer } from './components/renderers/process-actions-cell-renderer';
import { Status } from '../../shared/api/snapshot-refiner-api';

const PROCESS_HISTORY_TABLE = 'processHistory';

export const PROCESS_HISTORY_SORT_PARAMS: SortParams = {
    table: PROCESS_HISTORY_TABLE,
    tab: PROCESS_HISTORY_TABLE,
};

export const PROCESS_HISTORY_FILTER_PARAMS: Pick<FilterParams, 'type' | 'tab'> = {
    type: TableType.ProcessExecutionHistory,
    tab: PROCESS_HISTORY_TABLE,
};

// AG Grid filter option used by the commons-ui autocomplete filter to keep the rows matching one of the selected values
const enumFilterParams = {
    filterOptions: [
        {
            displayKey: 'customInRange',
            displayName: 'customInRange',
            predicate: (filterValues: (string | number)[][], cellValue: string | number) => {
                const allowedValues = filterValues[0];
                if (!allowedValues || allowedValues.length === 0) {
                    return true;
                }
                return allowedValues.map(String).includes(String(cellValue));
            },
        },
    ] as IFilterOptionDef[],
};

export const processResultsColumnsDefinition = (
    intl: IntlShape,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    onDownloadClick: (processUuid: string, caseName: string) => void
): ColDef[] => {
    const sortParams = PROCESS_HISTORY_SORT_PARAMS;
    const filterParams = PROCESS_HISTORY_FILTER_PARAMS;

    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'RawSnapshots' }),
            colId: 'caseName',
            field: 'caseName',
            suppressMovable: true,
            lockPosition: true,
            // fills the remaining width (AG Grid only applies flex to not pinned columns)
            flex: 1,
            minWidth: 210,
            resizable: true,
            filter: true,
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FilterDataTypes.TEXT,
                        comparators: [FilterTextComparators.STARTS_WITH, FilterTextComparators.CONTAINS],
                        debounceMs: 500,
                        ...filterParams,
                    },
                },
            },
            valueGetter: (params) => params.data.caseName ?? params.data.caseUuid,
        }),

        makeAgGridCustomHeaderColumn<CustomAggridAutocompleteFilterParams>({
            headerName: intl.formatMessage({ id: 'Status' }),
            colId: 'status',
            field: 'status',
            minWidth: 174,
            maxWidth: 174,
            filter: true,
            cellRenderer: ProcessStatusCellRenderer,
            filterParams: enumFilterParams,
            context: {
                sortParams,
                filterComponent: CustomAggridAutocompleteFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FilterDataTypes.TEXT,
                        ...filterParams,
                    },
                    options: Object.values(Status),
                    getOptionLabel: getEnumLabel,
                },
            },
            valueGetter: (params) => params.data.status,
            valueFormatter: (params: ValueFormatterParams) => getEnumLabel(params.data.status),
        }),

        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'StartedAt' }),
            colId: 'startedAt',
            field: 'startedAt',
            minWidth: 183,
            maxWidth: 183,
            cellRenderer: ProcessDateCellRenderer,
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
            cellRenderer: ProcessDateCellRenderer,
            context: {
                sortParams,
            },
            valueGetter: (params) => params.data.completedAt,
        }),

        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Actions' }),
            colId: 'actions',
            field: 'actions',
            // wide enough to display the "Actions" header without truncation
            minWidth: 96,
            maxWidth: 96,
            cellRenderer: ProcessActionsCellRenderer,
            cellRendererParams: (params: any) => ({
                processUuid: params.data.processUuid,
                status: params.data.status,
                caseName: params.data.caseName ?? params.data.caseUuid,
                onDownloadClick,
            }),
            sortable: false,
        }),
    ];
};
