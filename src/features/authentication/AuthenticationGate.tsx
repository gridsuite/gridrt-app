/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AuthenticationRouter, UserManagerState } from '@gridsuite/commons-ui';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import {
    selectAuthenticationRouterError,
    selectShowAuthenticationRouterLogin,
    selectSignInCallbackError,
} from './store/authentication.selectors';
import { useIsAuthenticated } from './use-is-authenticated';

type AuthenticationGateProps = PropsWithChildren<{ userManager: UserManagerState }>;

export function AuthenticationGate({ userManager, children }: Readonly<AuthenticationGateProps>) {
    const isAuthenticated = useIsAuthenticated();
    const signInCallbackError = useAppSelector(selectSignInCallbackError);
    const authenticationRouterError = useAppSelector(selectAuthenticationRouterError);
    const showAuthenticationRouterLogin = useAppSelector(selectShowAuthenticationRouterLogin);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    return isAuthenticated ? (
        children
    ) : (
        <AuthenticationRouter
            userManager={userManager}
            signInCallbackError={signInCallbackError}
            authenticationRouterError={authenticationRouterError}
            showAuthenticationRouterLogin={showAuthenticationRouterLogin}
            dispatch={dispatch}
            navigate={navigate}
            location={location}
        />
    );
}
