/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getAppName, PARAM_DEVELOPER_MODE } from '@gridsuite/commons-ui';
import { APP_NAME } from 'shared/config/application';
import { Preferences, PreferenceKey } from '../preferences.types';
import { useGetParameterQuery, useUpdateParameterMutation } from '../preferences-api';
import { getLocalStorageLanguage, getLocalStorageTheme } from '../preferences.storage';
import { DEFAULT_PREFERENCES } from '../preferences.defaults';
import { useIsAuthenticated } from '../../authentication';

function parsePreferenceValue<K extends PreferenceKey>(paramName: K, rawValue: string): Preferences[K] {
    if (paramName === PARAM_DEVELOPER_MODE) {
        return (rawValue === 'true') as Preferences[K];
    }
    return rawValue as Preferences[K];
}

function readPreferenceFallbacks(): Preferences {
    return {
        language: getLocalStorageLanguage(),
        theme: getLocalStorageTheme(),
        isDeveloperMode: DEFAULT_PREFERENCES.isDeveloperMode,
    };
}

const usePreferenceValue = <K extends PreferenceKey>(paramName: K) => {
    const isAuthenticated = useIsAuthenticated();

    return useGetParameterQuery(
        { name: paramName, appName: getAppName(APP_NAME, paramName) },
        {
            skip: !isAuthenticated,
            selectFromResult: (result) => {
                const rawData = result.data?.value;
                const data = rawData ? parsePreferenceValue(paramName, rawData) : readPreferenceFallbacks()[paramName];

                return {
                    ...result,
                    data,
                };
            },
        }
    );
};

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
