/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Close, Delete } from '@mui/icons-material';
import type { AgGridReact } from 'ag-grid-react';
import { useDeleteProcessExecutionMutation } from 'shared/api/snapshot-refiner-api';
import { useProcessResults } from '../hooks/use-process-list';
import { ProcessHistorySortProvider } from '../components/process-history-sort-provider';
import { ProcessHistoryFilterProvider } from '../components/process-history-filter-provider';
import { DeleteProcessDialog } from '../components/DeleteProcessDialog';
import ProcessHistoryTable from './ProcessHistoryTable';

function ProcessHistoryPage() {
    const { executions, isLoading, refresh } = useProcessResults();
    const [deleteProcess] = useDeleteProcessExecutionMutation();
    const gridRef = useRef<AgGridReact>(null);
    const [selectedCount, setSelectedCount] = useState(0);
    const [processesToDelete, setProcessesToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const openDeleteDialog = (processUuids: string[]) => {
        if (processUuids.length === 0) return;
        setProcessesToDelete(processUuids);
        setDeleteDialogOpen(true);
    };

    const confirmDeletion = async () => {
        if (isDeleting || processesToDelete.length === 0) return;
        setIsDeleting(true);
        await Promise.allSettled(processesToDelete.map((processUuid) => deleteProcess({ processUuid }).unwrap()));
        refresh();
        gridRef.current?.api?.deselectAll();
        setDeleteDialogOpen(false);
        setProcessesToDelete([]);
        setIsDeleting(false);
    };

    return (
        <ProcessHistorySortProvider>
            <ProcessHistoryFilterProvider>
                <Stack
                    sx={{
                        height: '100%',
                        width: '100%',
                        px: 3,
                    }}
                >
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', my: 2 }}>
                        <Box sx={{ py: 1 }}>
                            {
                                // Small hack to avoid a glitch when selection happens
                            }
                            <Typography variant="h5">
                                <FormattedMessage id="topBar.processHistory" />
                            </Typography>
                        </Box>
                        {selectedCount > 0 && (
                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                                <Typography>
                                    <FormattedMessage
                                        id="processHistory.selectedCount"
                                        values={{ count: selectedCount }}
                                    />
                                </Typography>
                                <Button startIcon={<Close />} onClick={() => gridRef.current?.api?.deselectAll()}>
                                    <FormattedMessage id="processHistory.cancelSelection" />
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={() =>
                                        openDeleteDialog(
                                            gridRef.current?.api?.getSelectedRows().map((row) => row.processUuid) ?? []
                                        )
                                    }
                                >
                                    <FormattedMessage id="processHistory.deleteSelected" />
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                    <ProcessHistoryTable
                        executions={executions}
                        isLoading={isLoading}
                        gridRef={gridRef}
                        onSelectionChange={setSelectedCount}
                        onDeleteProcess={(processUuid) => openDeleteDialog([processUuid])}
                    />
                    <DeleteProcessDialog
                        open={deleteDialogOpen}
                        count={processesToDelete.length}
                        onClose={() => setDeleteDialogOpen(false)}
                        onConfirm={confirmDeletion}
                        isDeleting={isDeleting}
                    />
                </Stack>
            </ProcessHistoryFilterProvider>
        </ProcessHistorySortProvider>
    );
}

export default ProcessHistoryPage;
