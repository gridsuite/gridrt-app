/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { Delete, FileDownload } from '@mui/icons-material';
import { Status, useDownloadResultCaseMutation } from '../../../../shared/api/snapshot-refiner-api';

export type ProcessActionsCellRendererProps = {
    processUuid: string;
    status: Status;
    caseName: string;
};

export function ProcessActionsCellRenderer({
    processUuid,
    status,
    caseName,
}: Readonly<ProcessActionsCellRendererProps>) {
    const [downloadResultCase] = useDownloadResultCaseMutation();
    const downloadAction = useCallback(async () => {
        await downloadResultCase({ processUuid, caseName });
    }, [downloadResultCase, processUuid, caseName]);

    return (
        <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Tooltip title={<FormattedMessage id="DeleteProcess" />}>
                <Delete className="process-delete-icon" fontSize="small" color="action" />
            </Tooltip>
            <Tooltip title={<FormattedMessage id="DownloadCase" />}>
                <span>
                    <IconButton
                        size="small"
                        disabled={status !== Status.Completed}
                        color="primary"
                        onClick={downloadAction}
                    >
                        <FileDownload fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>
    );
}
