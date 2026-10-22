/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppBar, Button, Divider, Stack, Toolbar, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { RunProcessDialog } from '../../run-process/components/RunProcessDialog';
import { SandboxModeToggle } from './SandboxModeToggle';
import { AppNavBar } from './AppNavBar';
import type { UserProfile } from '../../authentication/store/authentication.type';
import { APP_PATHS } from '../../../app/router/app-paths';

export type AppTopBarProps = {
    userProfile: UserProfile | null;
};

const SANDBOX_ACTIVE_BACKGROUND = 'rgba(156, 39, 176, 0.08)';

function AppTopBar({ userProfile }: Readonly<AppTopBarProps>) {
    const intl = useIntl();
    const theme = useTheme();
    const [isSandboxMode, setSandboxMode] = useState(false);
    const [isRunDialogOpen, setRunDialogOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // the process history is only available in sandbox mode
    useEffect(() => {
        if (!isSandboxMode && location.pathname.startsWith(APP_PATHS.processHistory)) {
            navigate(APP_PATHS.home, { replace: true });
        }
    }, [isSandboxMode, location.pathname, navigate]);

    const toolbarBackground = isSandboxMode
        ? SANDBOX_ACTIVE_BACKGROUND
        : theme.palette.grey[theme.palette.mode === 'dark' ? 800 : 100];

    return (
        <AppBar position="sticky" color="default" elevation={0}>
            {userProfile !== null && (
                <Toolbar
                    disableGutters
                    sx={{
                        minHeight: { xs: 56 },
                        px: 3,
                        py: 2,
                        alignItems: 'center',
                        flexShrink: 0,
                        bgcolor: toolbarBackground,
                    }}
                >
                    {isSandboxMode && <AppNavBar />}
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', ml: 'auto', flexWrap: 'nowrap' }}>
                        {isSandboxMode && (
                            <>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={() => setRunDialogOpen(true)}
                                    sx={{
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap',
                                        typography: 'subtitle2',
                                    }}
                                >
                                    {intl.formatMessage({ id: 'topBar.runProcess' })}
                                </Button>
                                <Divider orientation="vertical" flexItem />
                            </>
                        )}
                        <SandboxModeToggle isSandboxMode={isSandboxMode} onChange={setSandboxMode} />
                    </Stack>
                </Toolbar>
            )}
            <RunProcessDialog open={isRunDialogOpen} onClose={() => setRunDialogOpen(false)} />
        </AppBar>
    );
}

export default AppTopBar;
