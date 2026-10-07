/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Divider, Stack, Toolbar, useTheme } from '@mui/material';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { RunProcessDialog } from './RunProcessDialog';
import { SandboxModeToggle } from './SandboxModeToggle';

export type ProcessActionsProps = {
    isAuthenticated: boolean;
};

const SANDBOX_ACTIVE_BACKGROUND = 'rgba(156, 39, 176, 0.08)';

export function ProcessActions({ isAuthenticated }: Readonly<ProcessActionsProps>) {
    const intl = useIntl();
    const theme = useTheme();
    const [isSandboxMode, setSandboxMode] = useState(false);
    const [isRunDialogOpen, setRunDialogOpen] = useState(false);

    const toolbarBackground = isSandboxMode
        ? SANDBOX_ACTIVE_BACKGROUND
        : theme.palette.grey[theme.palette.mode === 'dark' ? 800 : 100];

    return (
        <>
            {isAuthenticated && (
                <Toolbar
                    disableGutters
                    sx={{
                        height: 56,
                        px: 3,
                        py: 2,
                        alignItems: 'center',
                        flexShrink: 0,
                        bgcolor: toolbarBackground,
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 'auto', flexWrap: 'nowrap' }}>
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
                                        textTransform: 'none',
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
        </>
    );
}
