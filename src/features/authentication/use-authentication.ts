/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { useMatch } from 'react-router';
import { initializeAuthenticationProd, logout, UserManagerState } from '@gridsuite/commons-ui';
import { useAppDispatch } from 'app/store/hooks';
import { getErrorMessage } from 'shared/lib/get-error-message';
import { fetchIdpSettings } from './fetch-idp-settings';

export function useAuthentication() {
    const [userManager, setUserManager] = useState<UserManagerState>({ instance: null, error: null });

    const dispatch = useAppDispatch();

    // Can't use lazy initializer because useMatch is a hook
    const [initialMatchSilentRenewCallbackUrl] = useState(
        useMatch({
            path: '/silent-renew-callback',
        })
    );

    const [initialMatchSigninCallbackUrl] = useState(
        useMatch({
            path: '/sign-in-callback',
        })
    );

    useEffect(() => {
        // need subfunction when async as suggested by rule react-hooks/exhaustive-deps
        (async function initializeAuthentication() {
            try {
                setUserManager({
                    instance: await initializeAuthenticationProd(
                        dispatch,
                        initialMatchSilentRenewCallbackUrl != null,
                        fetchIdpSettings,
                        initialMatchSigninCallbackUrl != null
                    ),
                    error: null,
                });
            } catch (error) {
                setUserManager({
                    instance: null,
                    error: getErrorMessage(error),
                });
            }
        })();
        // Note: dispatch and initialMatchSilentRenewCallbackUrl won't change
    }, [initialMatchSigninCallbackUrl, initialMatchSilentRenewCallbackUrl, dispatch]);

    const onLogoutClick = () => logout(dispatch, userManager.instance)?.catch((err) => console.error(err));

    return { userManager, onLogoutClick };
}
