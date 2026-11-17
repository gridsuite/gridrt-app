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

function renderAppTopBar(
    userProfile: AppTopBarProps['userProfile'] = {
        sub: 'test-user',
        iss: 'test-issuer',
        aud: 'test-audience',
        exp: 0,
        iat: 0,
    }
) {
    return render(
        <IntlProvider locale="en" messages={appMessages.en}>
            <MemoryRouter>
                <ThemeProvider theme={theme}>
                    <AppTopBar userProfile={userProfile} />
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
        const { container } = renderAppTopBar(null);

        expect(container.querySelector('.MuiToolbar-root')).toBeNull();
    });
});
