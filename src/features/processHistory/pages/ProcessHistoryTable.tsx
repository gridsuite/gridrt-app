/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    enableClickSelection: false,
};

export default function ProcessHistoryTable({ executions, isLoading }: Readonly<ProcessExecutionListProps>) {
    const theme = useTheme();
    const gridRef = useRef<AgGridReact>(null);
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
    }, [sortState]);

    useEffect(() => {
        updateAgGridFilters(gridRef.current?.api, filters);
    }, [filters]);

    const getCustomRowStyle = useCallback((): RowStyle => ({ background: theme.palette.background.default }), [theme]);

    const getEnumLabel = useCallback(
        (value: string) => intl.formatMessage({ id: value, defaultMessage: value }),
        [intl]
    );

    const columns = useMemo(() => {
        return processResultsColumnsDefinition(intl, getEnumLabel);
    }, [intl, getEnumLabel]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                '& .ag-selection-checkbox, & .ag-header-select-all': {
                    visibility: hasSelection ? 'visible' : 'hidden',
                },
                '& .ag-row:hover .ag-selection-checkbox, & .ag-row:focus-within .ag-selection-checkbox': {
                    visibility: 'visible',
                },
                '& .ag-header-cell:hover .ag-header-select-all, & .ag-header-cell:focus-within .ag-header-select-all': {
                    visibility: 'visible',
                },
                '& .process-delete-icon': {
                    visibility: 'hidden',
                },
                '& .ag-row:hover .process-delete-icon, & .ag-row:focus-within .process-delete-icon': {
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
                onSelectionChanged={({ api }) => setHasSelection(api.getSelectedNodes().length > 0)}
                onGridReady={({ api }) => {
                    applyTableState(api);
                }}
                getRowStyle={getCustomRowStyle}
            />
        </Box>
    );
}
