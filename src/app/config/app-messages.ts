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
    exportNetworkEn,
    exportNetworkFr,
    descriptionEn,
    descriptionFr,
    parametersFr,
    parametersEn,
    treeviewFinderEn,
    treeviewFinderFr,
    genericValidationFr,
    genericValidationEn,
    networkModificationsEn,
    networkModificationsFr,
    commonButtonEn,
    commonButtonFr,
} from '@gridsuite/commons-ui';
import type { IntlConfig } from 'react-intl';
import pluginMessagesEn from 'plugins/translations/en.json';
import pluginMessagesFr from 'plugins/translations/fr.json';
import messagesEn from 'shared/translations/en/common.json';
import messagesFr from 'shared/translations/fr/common.json';

export const appMessages: Record<GsLangUser, IntlConfig['messages']> = {
    en: {
        ...messagesEn,
        ...loginEn,
        ...topBarEn,
        ...cardErrorBoundaryEn,
        ...exportNetworkEn,
        ...descriptionEn,
        ...parametersEn,
        ...treeviewFinderEn,
        ...genericValidationEn,
        ...networkModificationsEn,
        ...commonButtonEn,
        ...pluginMessagesEn, // keep it at the end to allow translation overwriting
    },
    fr: {
        ...messagesFr,
        ...loginFr,
        ...topBarFr,
        ...cardErrorBoundaryFr,
        ...exportNetworkFr,
        ...descriptionFr,
        ...parametersFr,
        ...treeviewFinderFr,
        ...genericValidationFr,
        ...networkModificationsFr,
        ...commonButtonFr,
        ...pluginMessagesFr, // keep it at the end to allow translation overwriting
    },
};
