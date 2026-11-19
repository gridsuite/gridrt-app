/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { appMessages } from '../../../../app/config/app-messages';
import { getAppTheme } from '../../../../app/config/app-theme';
import AppTopBar, { type AppTopBarProps } from '../AppTopBar';

vi.mock('../../../run-process/components/RunProcessDialog', () => ({
    RunProcessDialog: () => null,
}));

const theme = getAppTheme(LIGHT_THEME);

const defaultUserProfile: AppTopBarProps['userProfile'] = {
    sub: 'test-user',
    iss: 'test-issuer',
    aud: 'test-audience',
    exp: 0,
    iat: 0,
};

function renderAppTopBar({
    userProfile = defaultUserProfile,
    isWebSocketDisconnected = false,
    onRefreshTaggedQueries = vi.fn(),
}: Partial<AppTopBarProps> = {}) {
    return render(
        <IntlProvider locale="en" messages={appMessages.en}>
            <MemoryRouter>
                <ThemeProvider theme={theme}>
                    <AppTopBar
                        userProfile={userProfile}
                        isWebSocketDisconnected={isWebSocketDisconnected}
                        onRefreshTaggedQueries={onRefreshTaggedQueries}
                    />
                </ThemeProvider>
            </MemoryRouter>
        </IntlProvider>
    );
}

describe('AppTopBar', () => {
    it('switches the background when sandbox mode is toggled', async () => {
        const user = userEvent.setup();
        const { container } = renderAppTopBar();
        const toolbar = container.querySelector('.MuiToolbar-root');

        expect(toolbar).not.toBeNull();
        expect(toolbar).toHaveStyle({ backgroundColor: theme.topBar.defaultMode.background });

        await user.click(screen.getByRole('switch'));

        expect(toolbar).toHaveStyle({ backgroundColor: theme.topBar.sandboxMode.background });
        expect(screen.getByRole('button', { name: 'Run process' })).toBeInTheDocument();

        await user.click(screen.getByRole('switch'));

        expect(toolbar).toHaveStyle({ backgroundColor: theme.topBar.defaultMode.background });
    });

    it('does not render a toolbar when no user is authenticated', () => {
        const { container } = renderAppTopBar({ userProfile: null });

        expect(container.querySelector('.MuiToolbar-root')).toBeNull();
    });

    it('does not display the websocket indicator when websockets are connected', () => {
        renderAppTopBar();

        expect(screen.queryByRole('img', { name: 'Live updates unavailable' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Refresh data' })).not.toBeInTheDocument();
    });

    it('displays the websocket indicator and refreshes data on click when a websocket is disconnected', async () => {
        const user = userEvent.setup();
        const onRefreshTaggedQueries = vi.fn();
        renderAppTopBar({ isWebSocketDisconnected: true, onRefreshTaggedQueries });

        expect(document.querySelector('svg[aria-label="Live updates unavailable"]')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Refresh data' }));

        expect(onRefreshTaggedQueries).toHaveBeenCalledTimes(1);
    });
});
