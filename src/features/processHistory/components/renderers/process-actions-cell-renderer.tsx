/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { Delete, FileDownload } from '@mui/icons-material';
import { Status, useDownloadResultCaseMutation } from '../../../../shared/api/snapshot-refiner-api';

export type ProcessActionsCellRendererProps = {
    processUuid: string;
    status: Status;
    caseName: string;
    onDeleteProcess?: (processUuid: string) => void;
};

export function ProcessActionsCellRenderer({
    processUuid,
    status,
    caseName,
    onDeleteProcess,
}: Readonly<ProcessActionsCellRendererProps>) {
    const intl = useIntl();
    const [downloadResultCase] = useDownloadResultCaseMutation();
    const downloadAction = useCallback(async () => {
        await downloadResultCase({ processUuid, caseName });
    }, [downloadResultCase, processUuid, caseName]);

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title={<FormattedMessage id="DeleteProcess" />}>
                <IconButton
                    className="process-delete-icon"
                    size="small"
                    aria-label={intl.formatMessage({ id: 'DeleteProcess' })}
                    onClick={() => onDeleteProcess?.(processUuid)}
                >
                    <Delete fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title={<FormattedMessage id="DownloadCase" />}>
                <span>
                    <IconButton
                        size="small"
                        disabled={status !== Status.Completed}
                        aria-label={intl.formatMessage({ id: 'DownloadCase' })}
                        onClick={downloadAction}
                    >
                        <FileDownload fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>
    );
}
