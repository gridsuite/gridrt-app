/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Close, Delete } from '@mui/icons-material';
import type { AgGridReact } from 'ag-grid-react';
import {
    ProcessStepType,
    Status,
    useDeleteProcessExecutionMutation,
    useDownloadResultCaseMutation,
} from 'shared/api/snapshot-refiner-api';
import { NetworkExportInfos, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { useProcessResults } from '../hooks/use-process-list';
import { ProcessHistorySortProvider } from '../components/process-history-sort-provider';
import { ProcessHistoryFilterProvider } from '../components/process-history-filter-provider';
import { DeleteProcessDialog } from '../components/DeleteProcessDialog';
import ProcessHistoryTable from './ProcessHistoryTable';
import { DownloadCaseDialog } from '../components/DownloadCaseDialog';
import { useDuplicateExistingCaseMutation } from '../../../shared/api/explore-api';
import { ProcessExecutionInfo } from '../model/process-execution-info';

export type ProcessToDownload = {
    processUuid: string;
    caseName: string;
};

function getCaseSavingResultUuid(executions: ProcessExecutionInfo[], selectedProcessUuid: string): string | undefined {
    const execution = executions.find(({ processUuid }) => processUuid === selectedProcessUuid);

    return execution?.executionSteps?.find(({ processStepType, status }) => {
        return processStepType === ProcessStepType.CaseSaving && status === Status.Completed;
    })?.resultUuid;
}

function ProcessHistoryPage() {
    const { executions, isLoading, refresh } = useProcessResults();
    const [deleteProcess] = useDeleteProcessExecutionMutation();
    const [downloadResultCase] = useDownloadResultCaseMutation();
    const [duplicateExistingCase] = useDuplicateExistingCaseMutation();
    const intl = useIntl();
    const { snackInfo, snackSuccess, snackError } = useSnackMessage();
    const gridRef = useRef<AgGridReact>(null);
    const [processToDownload, setProcessToDownload] = useState<ProcessToDownload | null>(null);
    const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
    const deletionTargets = useRef<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

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
        setIsDeleting(false);
    };

    const openDownloadDialog = useCallback((processUuid: string, caseName: string) => {
        setProcessToDownload({ processUuid, caseName });
        setDownloadDialogOpen(true);
    }, []);

    const closeDownloadDialog = useCallback(() => {
        setDownloadDialogOpen(false);
        setProcessToDownload(null);
    }, []);

    const onDownloadCase = useCallback(
        async (_params: Record<string, any>, exportInfos: NetworkExportInfos) => {
            if (!processToDownload) {
                return;
            }
            const { processUuid } = processToDownload;
            const { fileName, parentDirectoryUuid, description } = exportInfos;

            closeDownloadDialog();

            const startDownload = () => {
                snackInfo({
                    messageTxt: intl.formatMessage({ id: 'downloadCase.message.started' }, { fileName }),
                });
                setIsDownloading(true);
            };

            try {
                if (exportInfos.exportToGridExplore) {
                    if (!parentDirectoryUuid) {
                        snackWithFallback(
                            snackError,
                            new Error('A parent directory is required to download a case on GridExplore'),
                            { headerId: 'downloadCase.message.failed' }
                        );
                        return;
                    }
                    const resultUuid = getCaseSavingResultUuid(executions, processUuid);
                    if (!resultUuid) {
                        snackWithFallback(
                            snackError,
                            new Error(
                                `No completed CASE_SAVING step with a resultUuid was found for process ${processUuid}`
                            ),
                            { headerId: 'downloadCase.message.failed' }
                        );
                        return;
                    }
                    startDownload();
                    await duplicateExistingCase({
                        sourceCaseUuid: resultUuid,
                        caseName: fileName,
                        parentDirectoryUuid,
                        description: description ?? '',
                    }).unwrap();
                } else {
                    startDownload();
                    await downloadResultCase({ processUuid, fileNameInput: fileName }).unwrap();
                }
                snackSuccess({
                    messageTxt: intl.formatMessage({ id: 'downloadCase.message.succeeded' }, { fileName }),
                    persist: true,
                });
            } finally {
                setIsDownloading(false);
            }
        },
        [
            processToDownload,
            executions,
            intl,
            closeDownloadDialog,
            downloadResultCase,
            duplicateExistingCase,
            snackError,
            snackInfo,
            snackSuccess,
        ]
    );

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
                                <Typography variant="body2">
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
                        onDownloadClick={openDownloadDialog}
                    />
                    <DeleteProcessDialog
                        open={deleteDialogOpen}
                        count={deletionTargets.current.length}
                        onClose={() => setDeleteDialogOpen(false)}
                        onConfirm={confirmDeletion}
                        isDeleting={isDeleting}
                    />
                    {downloadDialogOpen && (
                        <DownloadCaseDialog
                            open={downloadDialogOpen}
                            isDownloading={isDownloading}
                            processToDownload={processToDownload}
                            onClose={closeDownloadDialog}
                            onDownload={onDownloadCase}
                        />
                    )}
                </Stack>
            </ProcessHistoryFilterProvider>
        </ProcessHistorySortProvider>
    );
}

export default ProcessHistoryPage;
