/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren } from 'react';
import { IntlProvider } from 'react-intl';
import { appMessages } from 'app/i18n/app-messages';
import { createTestContext } from './create-test-context';

export function createUiTestContext() {
    const { store, wrapper: StoreProvider } = createTestContext();
    const wrapper = ({ children }: PropsWithChildren) => (
        <StoreProvider>
            <IntlProvider locale="en" messages={appMessages.en}>
                {children}
            </IntlProvider>
        </StoreProvider>
    );
    return { store, wrapper };
}
