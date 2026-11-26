/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppBar, Button, Divider, IconButton, Stack, Toolbar, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router';
import {
    PlayArrow as PlayArrowIcon,
    Refresh as RefreshIcon,
    SyncProblem as SyncProblemIcon,
} from '@mui/icons-material';
import { RunProcessDialog } from '../../run-process/components/RunProcessDialog';
import { SandboxModeToggle } from './SandboxModeToggle';
import { AppNavBar } from './AppNavBar';
import type { UserProfile } from '../../authentication/store/authentication.type';
import { APP_PATHS } from '../../../app/router/app-paths';

export type AppTopBarProps = {
    userProfile: UserProfile | null;
    isWebSocketDisconnected: boolean;
    onRefreshTaggedQueries: () => void;
};

function AppTopBar({ userProfile, isWebSocketDisconnected, onRefreshTaggedQueries }: Readonly<AppTopBarProps>) {
    const intl = useIntl();
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

    const websocketDisconnectedMessage = intl.formatMessage({ id: 'topBar.websocketDisconnected' });
    const refreshTaggedQueriesMessage = intl.formatMessage({ id: 'topBar.refreshTaggedQueries' });

    return (
        <AppBar position="sticky" color="default" elevation={0}>
            {userProfile !== null && (
                <Toolbar
                    disableGutters
                    sx={{
                        minHeight: { xs: 56 },
                        px: 3,
                        alignItems: 'center',
                        flexShrink: 0,
                        bgcolor: (theme) => theme.topBar[isSandboxMode ? 'sandboxMode' : 'defaultMode'].background,
                    }}
                >
                    {isSandboxMode && <AppNavBar />}
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', ml: 'auto', flexWrap: 'nowrap' }}>
                        {isWebSocketDisconnected && (
                            <>
                                <Tooltip title={websocketDisconnectedMessage}>
                                    <SyncProblemIcon
                                        color="error"
                                        role="img"
                                        aria-label={websocketDisconnectedMessage}
                                    />
                                </Tooltip>
                                <Tooltip title={refreshTaggedQueriesMessage}>
                                    <IconButton
                                        aria-label={refreshTaggedQueriesMessage}
                                        onClick={onRefreshTaggedQueries}
                                        color="secondary"
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
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
