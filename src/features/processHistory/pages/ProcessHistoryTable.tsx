/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
    CustomAGGrid,
    DefaultCellRenderer,
    updateAgGridFilters,
    useCustomAggridFilterContext,
    useCustomAggridSortContext,
} from '@gridsuite/commons-ui';
import { ColDef, GridApi, RowSelectionOptions, RowStyle } from 'ag-grid-community';
import { ProcessExecutionInfo } from '../model/process-execution-info';
import {
    PROCESS_HISTORY_FILTER_PARAMS,
    PROCESS_HISTORY_SORT_PARAMS,
    processResultsColumnsDefinition,
} from '../processHistoryUtils';

type ProcessExecutionListProps = {
    executions: ProcessExecutionInfo[];
    isLoading: boolean;
    gridRef: RefObject<AgGridReact | null>;
    onSelectionChange: (count: number) => void;
    onDeleteProcess: (processUuid: string) => void;
};

// only what differs from AG Grid defaults (sortable, no filter), columns override what is specific to them
const defaultColDef = {
    resizable: false,
    lockPinned: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    cellRenderer: DefaultCellRenderer,
} satisfies ColDef;

const rowSelection: RowSelectionOptions = {
    mode: 'multiRow',
    checkboxes: true,
    headerCheckbox: true,
    selectAll: 'filtered',
    enableClickSelection: false,
};

export default function ProcessHistoryTable({
    executions,
    isLoading,
    gridRef,
    onSelectionChange,
    onDeleteProcess,
}: Readonly<ProcessExecutionListProps>) {
    const theme = useTheme();
    const [hasSelection, setHasSelection] = useState(false);
    const intl = useIntl();
    const sortState = useCustomAggridSortContext().getSortConfig(PROCESS_HISTORY_SORT_PARAMS);
    const filters = useCustomAggridFilterContext().getFilters(PROCESS_HISTORY_FILTER_PARAMS);

    const applyTableState = useCallback(
        (api: GridApi) => {
            api.applyColumnState({
                state: sortState ?? [],
                defaultState: { sort: null },
            });
            updateAgGridFilters(api, filters);
        },
        [sortState, filters]
    );

    useEffect(() => {
        gridRef.current?.api?.applyColumnState({
            state: sortState ?? [],
            defaultState: { sort: null },
        });
    }, [gridRef, sortState]);

    useEffect(() => {
        updateAgGridFilters(gridRef.current?.api, filters);
    }, [filters, gridRef]);

    const getCustomRowStyle = useCallback((): RowStyle => ({ background: theme.palette.background.default }), [theme]);

    const getEnumLabel = useCallback(
        (value: string) => intl.formatMessage({ id: value, defaultMessage: value }),
        [intl]
    );

    const columns = useMemo(() => {
        return processResultsColumnsDefinition(intl, getEnumLabel, onDeleteProcess);
    }, [intl, getEnumLabel, onDeleteProcess]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                '& .ag-selection-checkbox': {
                    visibility: hasSelection ? 'visible' : 'hidden',
                },
                '& .ag-header-select-all': {
                    visibility: 'hidden',
                },
                '& .ag-row:hover .ag-selection-checkbox, & .ag-row:has(:focus-visible) .ag-selection-checkbox': {
                    visibility: 'visible',
                },
                '& .ag-header-cell:hover .ag-header-select-all': {
                    visibility: 'visible',
                },
                '& .ag-header-select-all:has(input:checked)': {
                    visibility: 'visible',
                },
                '& .ag-header-select-all:has(input:indeterminate)': {
                    visibility: 'visible',
                },
                '& .process-delete-icon': {
                    visibility: 'hidden',
                },
                '& .ag-row:hover .process-delete-icon, & .ag-row:has(:focus-visible) .process-delete-icon': {
                    visibility: 'visible',
                },
            }}
        >
            <CustomAGGrid
                ref={gridRef}
                rowData={executions}
                // on error there is no row: the grid shows its no rows overlay and the error is shown in a snackbar
                loading={isLoading}
                defaultColDef={defaultColDef}
                columnDefs={columns}
                rowSelection={rowSelection}
                selectionColumnDef={{ width: 48, sortable: false, resizable: false }}
                getRowId={({ data }) => data.processUuid}
                onSelectionChanged={({ api }) => {
                    const count = api.getSelectedNodes().length;
                    setHasSelection(count > 0);
                    onSelectionChange(count);
                }}
                onGridReady={({ api }) => {
                    applyTableState(api);
                }}
                getRowStyle={getCustomRowStyle}
            />
        </Box>
    );
}
