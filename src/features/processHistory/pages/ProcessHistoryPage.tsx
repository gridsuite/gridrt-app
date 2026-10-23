/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Stack, Typography } from '@mui/material';
import { NetworkExportInfos, PARAM_DEVELOPER_MODE, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { useProcessResults } from '../hooks/use-process-list';
import { ProcessHistorySortProvider } from '../components/process-history-sort-provider';
import { ProcessHistoryFilterProvider } from '../components/process-history-filter-provider';
import ProcessHistoryTable from './ProcessHistoryTable';
import { DownloadCaseDialog } from '../components/DownloadCaseDialog';
import { useDownloadResultCaseMutation } from '../../../shared/api/snapshot-refiner-api';

export type ProcessToDownload = {
    processUuid: string;
    caseName: string;
};

function ProcessHistoryPage() {
    const intl = useIntl();
    const { snackInfo, snackSuccess, snackError } = useSnackMessage();
    const { executions, isLoading } = useProcessResults();
    const [downloadResultCase] = useDownloadResultCaseMutation();
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<ProcessToDownload | null>(null);

    const openDownloadDialog = useCallback((processUuid: string, caseName: string) => {
        setSelectedProcess({ processUuid, caseName });
        setDownloadDialogOpen(true);
    }, []);

    const closeDownloadDialog = useCallback(() => {
        setDownloadDialogOpen(false);
        setSelectedProcess(null);
    }, []);

    const onDownloadCase = useCallback(
        async (params: Record<string, any>, exportInfos: NetworkExportInfos) => {
            if (!selectedProcess) {
                return;
            }
            const { processUuid } = selectedProcess;
            const { fileName } = exportInfos;

            closeDownloadDialog();
            setIsDownloading(true);
            snackInfo({
                messageTxt: intl.formatMessage({ id: 'downloadCase.message.started' }, { fileName }),
            });
            try {
                if (!exportInfos.exportToGridExplore) {
                    // Local download
                    await downloadResultCase({ processUuid, fileNameInput: fileName });
                } else {
                    //    await

                }
                snackSuccess({
                    messageTxt: intl.formatMessage({ id: 'downloadCase.message.succeeded' }, { fileName }),
                    persist: true,
                });
            } catch (error) {
                snackWithFallback(snackError, error, { headerId: 'downloadCase.message.failed' });
            } finally {
                setIsDownloading(false);
            }
        },
        [selectedProcess, closeDownloadDialog]
    );

    //const onDownloadCase = useCallback(
    //    (params, exportInfos) => {
    //        exportNetworkFile(studyUuid, nodeUuid, currentRootNetworkUuid, params, exportInfos)
    //            .then((response) => {
    //                subscribeExport(response, exportInfos.fileName);
    //            })
    //            .catch((error) => {
    //                snackWithFallback(snackError, error);
    //            });
    //        setdownloadDialogOpen(false);
    //    },
    //    [subscribeExport, snackError]
    //);

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
                    <Typography variant="h5" sx={{ my: 3 }}>
                        <FormattedMessage id="topBar.processHistory" />
                    </Typography>
                    <ProcessHistoryTable
                        executions={executions}
                        isLoading={isLoading}
                        onDownloadClick={openDownloadDialog}
                    />
                    {downloadDialogOpen && (
                        <DownloadCaseDialog
                            open={downloadDialogOpen}
                            isDownloading={isDownloading}
                            selectedProcess={selectedProcess}
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
