/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Stack } from '@mui/material';
import { PropsWithChildren } from 'react';
import { DevModeBanner, PARAM_DEVELOPER_MODE } from '@gridsuite/commons-ui';
import { usePreference } from 'features/preferences/use-preference';
import { useIsAuthenticated } from 'features/authentication';
import AppTopBar from 'app/layout/AppTopBar';
import { AppSideBar } from 'app/layout/AppSideBar';

export type AppLayoutProps = {
    onLogoutClick?: () => void;
};

export function AppLayout({ onLogoutClick, children }: Readonly<PropsWithChildren<AppLayoutProps>>) {
    const { value: isDeveloperMode } = usePreference(PARAM_DEVELOPER_MODE);
    const isAuthenticated = useIsAuthenticated();

    return (
        <Stack height="100vh" overflow="hidden">
            {isAuthenticated && isDeveloperMode && <DevModeBanner />}
            <Stack direction="row" flex={1} overflow="hidden">
                <AppSideBar onLogoutClick={onLogoutClick} />
                <Stack flex={1} overflow="hidden">
                    <AppTopBar isAuthenticated={isAuthenticated} />
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                        }}
                    >
                        {children}
                    </Box>
                </Stack>
            </Stack>
        </Stack>
    );
}
