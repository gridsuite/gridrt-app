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
import { CustomAGGrid, DefaultCellRenderer } from '@gridsuite/commons-ui';
import { GridApi, RowStyle } from 'ag-grid-community';
import { ProcessExecutionInfo } from '../model/process-execution-info';
import { useAppSelector } from '../../../app/store/store';
import { PROCESS_HISTORY_SORT_STORE } from '../store/history-process.constants';
import { AGGRID_LOCALES } from '../../../shared/translations/not-intl/aggrid-locales';
import { processResultsColumnsDefinition } from '../processHistoryUtils';

type ProcessExecutionListProps = {
    executions: ProcessExecutionInfo[];
};

export default function ProcessHistoryTable({ executions }: Readonly<ProcessExecutionListProps>) {
    const theme = useTheme();
    const gridRef = useRef<AgGridReact>(null);
    const intl = useIntl();
    const tableSort = useAppSelector((state) => state.processHistory.tableSort);

    const applyTableState = useCallback(
        (api: GridApi) => {
            const sortState = tableSort[PROCESS_HISTORY_SORT_STORE]?.[PROCESS_HISTORY_SORT_STORE];
            api.applyColumnState({
                state: sortState ?? [],
                defaultState: { sort: null },
            });
        },
        [tableSort]
    );

    useEffect(() => {
        const sortState = tableSort[PROCESS_HISTORY_SORT_STORE]?.[PROCESS_HISTORY_SORT_STORE];
        gridRef.current?.api?.applyColumnState({
            state: sortState ?? [],
            defaultState: { sort: null },
        });
    }, [tableSort]);

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

    const columns = useMemo(() => {
        return processResultsColumnsDefinition(intl);
    }, [intl]);

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
                /*
                onRowClicked={({ data }) => {
                    navigate(PROCESS_PATHS.stepInfos(data.id ?? ''));
                }}
                */
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
