/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Tabs, Tab, Box, Typography, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { NavLink, useLocation } from 'react-router';
import { ListAlt } from '@mui/icons-material';
import { type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { APP_PATHS } from '../../../app/router/app-paths';

interface NavBarTab {
    icon: ReactNode;
    labelId: string;
    path: string;
}

const leftTabs: NavBarTab[] = [{ icon: <ListAlt />, labelId: 'topBar.processHistory', path: APP_PATHS.processHistory }];

function TabLabel({ icon, label }: { readonly icon: ReactNode; readonly label: string }) {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));

    return (
        <Tooltip title={label} disableHoverListener={!isXs} disableFocusListener={!isXs} disableTouchListener={!isXs}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                {icon}
                <Typography sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    <span>{label}</span>
                </Typography>
            </Box>
        </Tooltip>
    );
}

export function AppNavBar() {
    const location = useLocation();
    const intl = useIntl();

    const currentTab = leftTabs.find((t) => location.pathname.startsWith(t.path))?.path ?? false;

    return (
        <Tabs value={currentTab}>
            {leftTabs.map((tab) => (
                <Tab
                    key={tab.path}
                    value={tab.path}
                    component={NavLink}
                    to={tab.path}
                    label={<TabLabel icon={tab.icon} label={intl.formatMessage({ id: tab.labelId })} />}
                />
            ))}
        </Tabs>
    );
}
