/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GsLang, GsTheme, PARAM_LANGUAGE, PARAM_THEME } from '@gridsuite/commons-ui';
import type { AppDispatch } from 'app/store/store';
import { ConfigTags, configGeneratedApi } from 'shared/api/config-api';
import { saveLocalStorageLanguage, saveLocalStorageTheme } from './preferences.storage';

export const preferencesApi = configGeneratedApi.enhanceEndpoints({
    endpoints: {
        getParameter: {
            providesTags: (result, error, params) => [{ type: ConfigTags.Parameters, id: params.name }],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (typeof data.value !== 'string') {
                        return;
                    }

                    switch (data.name) {
                        case PARAM_LANGUAGE:
                            saveLocalStorageLanguage(data.value as GsLang); // TODO: fix with actual check ?
                            break;
                        case PARAM_THEME:
                            saveLocalStorageTheme(data.value as GsTheme); // TODO: fix with actual check ?
                            break;
                        default:
                            // should not happen
                            break;
                    }
                } catch (error) {
                    console.debug('getConfigParameter RTK query failed (ignored here)', error);
                }
            },
        },
        updateParameter: {
            async onQueryStarted(params, { dispatch, queryFulfilled }) {
                const patch = dispatch(
                    preferencesApi.util.updateQueryData(
                        'getParameter',
                        { name: params.name, appName: params.appName },
                        (draft) => {
                            if (draft) {
                                draft.value = params.value;
                            }
                        }
                    )
                );

                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
        },
    },
});

export const invalidatePreferenceQueries = (dispatch: AppDispatch, paramName: string) => {
    dispatch(preferencesApi.util.invalidateTags([{ type: ConfigTags.Parameters, id: paramName }]));
};

export const { useGetParameterQuery, useUpdateParameterMutation } = preferencesApi;
