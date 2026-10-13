/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
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
import { PropsWithChildren } from 'react';
import { store } from './store/store';
import { appMessages } from './config/app-messages';
import { getAppTheme } from './config/theme/app-theme';
import { useGetConfigParameterWithFallback } from '../features/app-parameters/hooks/use-get-config-parameter-with-fallback';
import { useNotificationsUrlGenerator } from '../shared/api/ws/use-notifications-url-generator';
import { SnackRefRegisterer } from '../features/snacking/SnackRefRegisterer';

const basename = new URL(document.querySelector('base')?.href ?? '').pathname;

function AppProviders({ children }: PropsWithChildren) {
    const { data: language } = useGetConfigParameterWithFallback(PARAM_LANGUAGE);
    const computedLanguage = getComputedLanguage(language);
    const { data: theme } = useGetConfigParameterWithFallback(PARAM_THEME);

    const urlMapper = useNotificationsUrlGenerator();

    return (
        <Provider store={store}>
            <IntlProvider locale={computedLanguage} messages={appMessages[computedLanguage]}>
                <BrowserRouter basename={basename}>
                    <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={getAppTheme(theme)}>
                            <SnackbarProvider hideIconVariant={false}>
                                <SnackRefRegisterer />
                                <CssBaseline />
                                <CardErrorBoundary>
                                    <NotificationsProvider urls={urlMapper}>{children}</NotificationsProvider>
                                </CardErrorBoundary>
                            </SnackbarProvider>
                        </ThemeProvider>
                    </StyledEngineProvider>
                </BrowserRouter>
            </IntlProvider>
        </Provider>
    );
}

export default AppProviders;
