/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getAppName } from '@gridsuite/commons-ui';
import { APP_NAME } from 'shared/config/application';
import { useGetParameterQuery } from 'features/preferences/preferences-api';
import { readPreferenceFallbacks } from 'features/preferences/preferences.fallbacks';
import { PreferenceKey } from 'features/preferences/preferences.types';
import { parsePreferenceValue } from 'features/preferences/preferences.mapping';
import { useStableUserProfile } from 'features/authentication/hooks/use-stable-user-profile';

/**
 * This data is fetched from AppSideBar, which is displayed before user is authenticated
 * If user is not authenticated, or before the fetch request has responded, we read stored preferences with defaults
 */
export const usePreferenceValue = <K extends PreferenceKey>(paramName: K) => {
    const userProfile = useStableUserProfile();

    return useGetParameterQuery(
        { name: paramName, appName: getAppName(APP_NAME, paramName) },
        {
            skip: !userProfile,
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
