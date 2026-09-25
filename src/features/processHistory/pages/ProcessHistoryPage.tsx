/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Box, Typography } from '@mui/material';
import { useProcessResults } from '../hooks/use-process-list';
import { HistoryProcessAlert } from '../components/HistoryProcessAlert';
import { CustomAggridReduxProvider } from '../components/custom-aggrid-redux-provider';
import ProcessHistoryTable from './ProcessHistoryTable';

function ProcessResultsPage() {
    const { executions, isEmpty, isError, isLoading } = useProcessResults();

    return (
        <CustomAggridReduxProvider>
            <HistoryProcessAlert isEmpty={isEmpty} isError={isError} isLoading={isLoading} />
            {!isError && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', px: '24px' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            ml: 1,
                        }}
                    >
                        <Typography variant="h5" sx={{ mt: '24px', mb: '24px' }}>
                            <FormattedMessage id="ProcessExecutionHistory" />
                        </Typography>
                    </Box>
                    <ProcessHistoryTable executions={executions} />
                </Box>
            )}
        </CustomAggridReduxProvider>
    );
}

export default ProcessResultsPage;
