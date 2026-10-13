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
import { GridApi, RowStyle } from 'ag-grid-community';
import { ProcessExecutionInfo } from '../model/process-execution-info';
import { AGGRID_LOCALES } from '../../../shared/translations/not-intl/aggrid-locales';
import {
    PROCESS_HISTORY_FILTER_PARAMS,
    PROCESS_HISTORY_SORT_PARAMS,
    processResultsColumnsDefinition,
} from '../processHistoryUtils';

type ProcessExecutionListProps = {
    executions: ProcessExecutionInfo[];
};

export default function ProcessHistoryTable({ executions }: Readonly<ProcessExecutionListProps>) {
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

    const defaultColDef = useMemo(
        () => ({
            filter: false,
            sortable: true,
            resizable: true,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const getCustomRowStyle = useCallback(
        (_cellData: any) => {
            const style: RowStyle = { background: theme.palette.background.default, highlightColor: 'yellow' };
            return {
                ...style,
            };
        },
        [theme]
    );

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
                ml: 1,
                '& .row-action-button': {
                    visibility: 'hidden',
                },
                '& .ag-row-hover .row-action-button': {
                    visibility: 'visible',
                },
                '& .ag-row': {
                    cursor: 'pointer',
                },
            }}
        >
            <CustomAGGrid
                ref={gridRef}
                rowData={executions}
                defaultColDef={defaultColDef}
                columnDefs={columns}
                overrideLocales={AGGRID_LOCALES}
                onGridReady={({ api }) => {
                    applyTableState(api);
                }}
                onModelUpdated={({ api }) => {
                    if (api.getDisplayedRowCount()) {
                        api.hideOverlay();
                    } else {
                        api.showNoRowsOverlay();
                    }
                }}
                getRowStyle={getCustomRowStyle}
            />
        </Box>
    );
}
