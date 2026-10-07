/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { StyledEngineProvider, ThemeProvider, CssBaseline } from '@mui/material';
import {
    CardErrorBoundary,
    getComputedLanguage,
    NotificationsProvider,
    PARAM_LANGUAGE,
    PARAM_THEME,
    SnackbarProvider,
} from '@gridsuite/commons-ui';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router';
import { Provider } from 'react-redux';
import { store } from 'app/store/store';
import App from 'app/App';
import { appMessages } from 'app/i18n/app-messages';
import { getAppTheme } from 'app/theme/app-theme';
import { usePreference } from 'features/preferences/use-preference';
import { useNotificationUrls } from 'app/notifications/use-notification-urls';
import { SnackbarBridge } from 'app/notifications/SnackbarBridge';

const basename = new URL(document.querySelector('base')?.href ?? '').pathname;

function AppEnvironmentProviders() {
    const { value: language } = usePreference(PARAM_LANGUAGE);
    const computedLanguage = getComputedLanguage(language);
    const { value: theme } = usePreference(PARAM_THEME);

    const urlMapper = useNotificationUrls();

    return (
        <IntlProvider locale={computedLanguage} messages={appMessages[computedLanguage]}>
            <BrowserRouter basename={basename}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={getAppTheme(theme)}>
                        <SnackbarProvider hideIconVariant={false}>
                            <SnackbarBridge />
                            <CssBaseline />
                            <CardErrorBoundary>
                                <NotificationsProvider urls={urlMapper}>
                                    <App />
                                </NotificationsProvider>
                            </CardErrorBoundary>
                        </SnackbarProvider>
                    </ThemeProvider>
                </StyledEngineProvider>
            </BrowserRouter>
        </IntlProvider>
    );
}

export function AppProviders() {
    return (
        <Provider store={store}>
            <AppEnvironmentProviders />
        </Provider>
    );
}
