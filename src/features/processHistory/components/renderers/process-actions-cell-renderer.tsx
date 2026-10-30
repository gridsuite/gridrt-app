/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { Delete, FileDownload } from '@mui/icons-material';
import { Status } from '../../../../shared/api/snapshot-refiner-api';

export type ProcessActionsCellRendererProps = {
    processUuid: string;
    status: Status;
    caseName: string;
    onDeleteProcess?: (processUuid: string) => void;
    onDownloadClick: (processUuid: string, caseName: string) => void;
};

export function ProcessActionsCellRenderer({
    processUuid,
    status,
    caseName,
    onDeleteProcess,
    onDownloadClick,
}: Readonly<ProcessActionsCellRendererProps>) {
    const intl = useIntl();

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title={<FormattedMessage id="DeleteProcess" />}>
                <IconButton
                    className="process-delete-icon"
                    size="small"
                    disabled={status === Status.Running}
                    aria-label={intl.formatMessage({ id: 'DeleteProcess' })}
                    onClick={() => onDeleteProcess?.(processUuid)}
                    // keep enough contrast on selected/hovered rows in light mode
                    sx={(theme) => (theme.palette.mode === 'light' ? { color: theme.palette.text.secondary } : {})}
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
                        onClick={() => onDownloadClick(processUuid, caseName)}
                        // keep enough contrast on selected/hovered rows in light mode
                        sx={(theme) => (theme.palette.mode === 'light' ? { color: theme.palette.text.secondary } : {})}
                    >
                        <FileDownload fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>
    );
}
