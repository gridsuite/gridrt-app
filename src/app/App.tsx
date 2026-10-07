/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CardErrorBoundary } from '@gridsuite/commons-ui';
import { AuthenticationGate, useAuthentication } from 'features/authentication';
import { usePreferenceNotifications } from 'features/preferences/use-preference-notifications';
import { AppRouter } from './router/AppRouter';
import { AppLayout } from './layout/AppLayout';

function App() {
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
export default App;
