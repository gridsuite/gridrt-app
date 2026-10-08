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
import { usePreference, usePreferenceNotifications } from 'features/preferences';
import { AuthenticationGate, useAuthentication } from 'features/authentication';
import { useSnackbarBridge } from 'features/snackbar';
import { store } from './store/store';
import { appMessages } from './i18n/app-messages';
import { getAppTheme } from './theme/app-theme';
import { AppRouter } from './router/AppRouter';
import { AppLayout } from './layout/AppLayout';
import { useNotificationUrls } from './use-notification-urls';

function AppContent() {
    useSnackbarBridge();
    const { userManager, onLogoutClick } = useAuthentication();
    usePreferenceNotifications();

    return (
        <AppLayout onLogoutClick={onLogoutClick}>
            <CardErrorBoundary>
                <AuthenticationGate userManager={userManager}>
                    <AppRouter />
                </AuthenticationGate>
            </CardErrorBoundary>
        </AppLayout>
    );
}

const basename = new URL(document.baseURI).pathname;

function AppEnvironment() {
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
                            <CssBaseline />
                            <CardErrorBoundary>
                                <NotificationsProvider urls={urlMapper}>
                                    <AppContent />
                                </NotificationsProvider>
                            </CardErrorBoundary>
                        </SnackbarProvider>
                    </ThemeProvider>
                </StyledEngineProvider>
            </BrowserRouter>
        </IntlProvider>
    );
}

function App() {
    return (
        <Provider store={store}>
            <AppEnvironment />
        </Provider>
    );
}

export default App;
