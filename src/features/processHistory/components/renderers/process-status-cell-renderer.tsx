/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Done, Autorenew, ErrorOutlineOutlined } from '@mui/icons-material';
import { Box, Chip, Icon, Stack, useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { ReactNode } from 'react';
import { Status } from '../../../../shared/api/snapshot-refiner-api';

export type ProcessStatusCellRendererProps = { value: Status; id: string };

export function ProcessStatusCellRenderer({ value }: Readonly<ProcessStatusCellRendererProps>) {
    const intl = useIntl();
    const theme = useTheme();

    let colorVal: string = '';
    let iconVal: ReactNode = <Icon />;

    switch (value) {
        case Status.Failed:
            colorVal = theme.palette.mode === 'light' ? '#D32F2F' : '#E57373';
            iconVal = <ErrorOutlineOutlined />;
            break;
        case Status.Running:
            colorVal = theme.palette.mode === 'light' ? '#A0F' : '#EA80FC';
            iconVal = <Autorenew />;
            break;
        default:
    }

    if (value !== Status.Completed) {
        return (
            <Box sx={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                <Chip
                    icon={iconVal}
                    label={intl.formatMessage({
                        id: value,
                    })}
                    size="small"
                    variant="outlined"
                    sx={{
                        color: colorVal,
                        borderColor: 'currentColor',
                        '& .MuiChip-icon': {
                            color: 'inherit',
                            marginRight: '1px',
                        },
                    }}
                />
            </Box>
        );
    }
    return (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Done sx={{ color: 'success.main' }} fontSize="small" />
            <span>
                {intl.formatMessage({
                    id: value,
                })}
            </span>
        </Stack>
    );
}
