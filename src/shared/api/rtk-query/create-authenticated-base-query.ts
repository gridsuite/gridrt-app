/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type AuthenticationQueryState = {
    authentication?: {
        user?: { id_token?: string } | null;
    };
};

export const createAuthenticatedBaseQuery = (baseUrl: string) =>
    fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers, { getState }) => {
            const state = getState() as AuthenticationQueryState;

            const token = state?.authentication?.user?.id_token;

            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        },
    });
