/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { IconButton, Tooltip } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { ProcessStepExecution, ProcessStepType, Status } from '../../../../shared/api/snapshot-refiner-api';
import { useLazyDirectDownloadQuery } from '../../../../shared/api/explore-api';

export type ProcessActionsCellRendererProps = {
    steps: ProcessStepExecution[];
    status: Status;
    caseName: string;
};

export function ProcessActionsCellRenderer({ steps, status, caseName }: Readonly<ProcessActionsCellRendererProps>) {
    const resultUuid = useMemo(
        () => steps.find((step) => step.processStepType === ProcessStepType.CaseSaving)?.resultUuid,
        [steps]
    );
    const [downloadCase] = useLazyDirectDownloadQuery();
    const downloadAction = useCallback(() => {
        if (resultUuid) {
            downloadCase({ caseUuid: resultUuid, fileName: `${caseName}.xiidm` }, false);
        }
    }, [resultUuid, downloadCase, caseName]);

    return (
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
    );
}
