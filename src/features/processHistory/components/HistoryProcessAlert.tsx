/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Alert, Paper, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

type ProcessResultsResultProps = {
    isEmpty: boolean;
    isError: boolean;
    isLoading: boolean;
};

export function HistoryProcessAlert({ isEmpty, isError, isLoading }: Readonly<ProcessResultsResultProps>) {
    if (isLoading) {
        return (
            <Paper sx={{ p: 3 }}>
                <Typography
                    variant="body1"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    <FormattedMessage id="Loading" />
                </Typography>
            </Paper>
        );
    }

    if (isError) {
        return (
            <Alert severity="error">
                <FormattedMessage id="ErrorChargingProcessHistory" />
            </Alert>
        );
    }

    if (isEmpty) {
        return (
            <Alert severity="info">
                <FormattedMessage id="NoProcessHistory" />
            </Alert>
        );
    }

    return null;
}
