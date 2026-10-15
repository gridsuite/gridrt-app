/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Stack, Typography } from '@mui/material';
import { useProcessResults } from '../hooks/use-process-list';
import { HistoryProcessAlert } from '../components/HistoryProcessAlert';
import { ProcessHistorySortProvider } from '../components/process-history-sort-provider';
import { ProcessHistoryFilterProvider } from '../components/process-history-filter-provider';
import ProcessHistoryTable from './ProcessHistoryTable';

function ProcessHistoryPage() {
    const { executions, isEmpty, isError, isLoading } = useProcessResults();

    return (
        <ProcessHistorySortProvider>
            <ProcessHistoryFilterProvider>
                <HistoryProcessAlert isEmpty={isEmpty} isError={isError} isLoading={isLoading} />
                {!isError && (
                    <Stack
                        sx={{
                            height: '100%',
                            width: '100%',
                            px: 3,
                        }}
                    >
                        <Typography variant="h5" sx={{ my: 3 }}>
                            <FormattedMessage id="ProcessExecutionHistory" />
                        </Typography>
                        <ProcessHistoryTable executions={executions} />
                    </Stack>
                )}
            </ProcessHistoryFilterProvider>
        </ProcessHistorySortProvider>
    );
}

export default ProcessHistoryPage;
