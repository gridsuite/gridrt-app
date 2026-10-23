/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef, useState } from 'react';
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
    const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
    const deletionTargets = useRef<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const openDeleteDialog = useCallback((processUuids: string[] | string) => {
        let formattedProcessUuids: string[];
        if (!Array.isArray(processUuids)) {
            formattedProcessUuids = [processUuids];
        } else {
            formattedProcessUuids = processUuids;
        }
        if (formattedProcessUuids.length === 0) {
            return;
        }
        deletionTargets.current = [...formattedProcessUuids];
        setDeleteDialogOpen(true);
    }, []);

    const confirmDeletion = async () => {
        if (isDeleting || deletionTargets.current.length === 0) {
            return;
        }
        setIsDeleting(true);
        await Promise.allSettled(deletionTargets.current.map((processUuid) => deleteProcess({ processUuid }).unwrap()));
        // eslint-disable-next-line no-void
        void refresh();
        setDeleteDialogOpen(false);
        deletionTargets.current = [];
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
                        {selectedProcesses.length > 0 && (
                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                                <Typography>
                                    <FormattedMessage
                                        id="processHistory.selectedCount"
                                        values={{ count: selectedProcesses.length }}
                                    />
                                </Typography>
                                <Button startIcon={<Close />} onClick={() => gridRef.current?.api?.deselectAll()}>
                                    <FormattedMessage id="processHistory.cancelSelection" />
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={() => openDeleteDialog(selectedProcesses)}
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
                        onSelectionChange={setSelectedProcesses}
                        onDeleteProcess={openDeleteDialog}
                    />
                    <DeleteProcessDialog
                        open={deleteDialogOpen}
                        count={deletionTargets.current.length}
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
