/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Preferences, PreferenceKey } from 'features/preferences/preferences.types';
import { getAppName } from '@gridsuite/commons-ui';
import { useUpdateParameterMutation } from 'features/preferences/preferences-api';
import { APP_NAME } from 'shared/config/application';
import { usePreferenceValue } from 'features/preferences/use-preference-value';

export function usePreference<K extends PreferenceKey>(paramName: K) {
    const { data: paramValue } = usePreferenceValue(paramName);
    const [updateConfigParameter, { isLoading: isUpdating }] = useUpdateParameterMutation();

    const update = async (newValue: Preferences[K]) => {
        await updateConfigParameter({
            appName: getAppName(APP_NAME, paramName),
            name: paramName,
            value: String(newValue),
        }).unwrap();
    };

    return { value: paramValue, update, isUpdating };
}
