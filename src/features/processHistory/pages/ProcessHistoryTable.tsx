/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
    CustomAGGrid,
    DefaultCellRenderer,
    updateAgGridFilters,
    useCustomAggridFilterContext,
    useCustomAggridSortContext,
} from '@gridsuite/commons-ui';
import { ColDef, GridApi, RowStyle } from 'ag-grid-community';
import { ProcessExecutionInfo } from '../model/process-execution-info';
import {
    PROCESS_HISTORY_FILTER_PARAMS,
    PROCESS_HISTORY_SORT_PARAMS,
    processResultsColumnsDefinition,
} from '../processHistoryUtils';

type ProcessExecutionListProps = {
    executions: ProcessExecutionInfo[];
    isLoading: boolean;
    onDownloadClick: (processUuid: string, caseName: string) => void;
};

// only what differs from AG Grid defaults (sortable, no filter), columns override what is specific to them
const defaultColDef = {
    resizable: false,
    lockPinned: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    cellRenderer: DefaultCellRenderer,
} satisfies ColDef;

export default function ProcessHistoryTable({
    executions,
    isLoading,
    onDownloadClick,
}: Readonly<ProcessExecutionListProps>) {
    const theme = useTheme();
    const gridRef = useRef<AgGridReact>(null);
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
        return processResultsColumnsDefinition(intl, getEnumLabel, onDownloadClick);
    }, [intl, getEnumLabel, onDownloadClick]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
            }}
        >
            <CustomAGGrid
                ref={gridRef}
                rowData={executions}
                // on error there is no row: the grid shows its no rows overlay and the error is shown in a snackbar
                loading={isLoading}
                defaultColDef={defaultColDef}
                columnDefs={columns}
                onGridReady={({ api }) => {
                    applyTableState(api);
                }}
                getRowStyle={getCustomRowStyle}
            />
        </Box>
    );
}
