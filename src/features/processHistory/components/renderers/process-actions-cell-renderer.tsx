/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import { IconButton, Tooltip } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { ProcessStepExecution, ProcessStepType, Status } from '../../../../shared/api/snapshot-refiner-api';

export type ProcessActionsCellRendererProps = { steps: ProcessStepExecution[]; id: string; status: Status };

export function ProcessActionsCellRenderer({ steps, id, status }: Readonly<ProcessActionsCellRendererProps>) {
    const intl = useIntl();

    const linkStyle = {
        color: 'inherit',
        textDecoration: 'none',
    };
    return (
        <Tooltip title={<FormattedMessage id="Download" />}>
            <IconButton
                onClick={() => {
                    const res = steps.find((step) => step.processStepType === ProcessStepType.CaseSaving)?.resultUuid;
                    console.info(`Download link clicked for process ${id} with result uuid ${res}`);
                }}
                size="small"
                disabled={status !== Status.Completed}
                color="primary"
            >
                <FileDownload fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}
