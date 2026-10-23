/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { IconButton, Tooltip } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { Status } from '../../../../shared/api/snapshot-refiner-api';

export type ProcessActionsCellRendererProps = {
    processUuid: string;
    status: Status;
    caseName: string;
    onDownloadClick: (processUuid: string, caseName: string) => void;
};

export function ProcessActionsCellRenderer({
    processUuid,
    status,
    caseName,
    onDownloadClick,
}: Readonly<ProcessActionsCellRendererProps>) {
    return (
        <Tooltip title={<FormattedMessage id="DownloadCase" />}>
            <span>
                <IconButton
                    size="small"
                    disabled={status !== Status.Completed}
                    color="primary"
                    onClick={() => onDownloadClick(processUuid, caseName)}
                >
                    <FileDownload fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
    );
}
