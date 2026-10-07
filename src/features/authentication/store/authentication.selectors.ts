/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'app/store/store';
import type { UserIdentity } from './authentication.type';

export const selectAuthentication = (state: RootState) => state.authentication;
export const selectSignInCallbackError = (state: RootState) => selectAuthentication(state).signInCallbackError;

export const selectAuthenticationRouterError = (state: RootState) =>
    selectAuthentication(state).authenticationRouterError;

export const selectShowAuthenticationRouterLogin = (state: RootState) =>
    selectAuthentication(state).showAuthenticationRouterLogin;

export const selectIsAuthenticated = (state: RootState) => selectAuthentication(state).user?.profile != null;

export const selectUserIdentity = createSelector(
    [(state: RootState) => selectAuthentication(state).user?.profile],
    (profile): UserIdentity | null => {
        if (!profile) {
            return null;
        }
        const { sub, name, email, profile: profileUrl } = profile;
        return { sub, name, email, profile: profileUrl };
    }
);

export const selectUserProfile = (state: RootState) => selectAuthentication(state).user?.profile ?? null;
