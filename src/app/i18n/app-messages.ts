/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    cardErrorBoundaryEn,
    cardErrorBoundaryFr,
    GsLangUser,
    loginEn,
    loginFr,
    topBarEn,
    topBarFr,
} from '@gridsuite/commons-ui';
import type { IntlConfig } from 'react-intl';
import messagesEn from './en.json';
import messagesFr from './fr.json';

export const appMessages: Record<GsLangUser, IntlConfig['messages']> = {
    en: {
        ...messagesEn,
        ...loginEn,
        ...topBarEn,
        ...cardErrorBoundaryEn,
    },
    fr: {
        ...messagesFr,
        ...loginFr,
        ...topBarFr,
        ...cardErrorBoundaryFr,
    },
};
