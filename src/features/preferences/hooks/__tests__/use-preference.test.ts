/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
    DARK_THEME,
    LANG_SYSTEM,
    LIGHT_THEME,
    PARAM_DEVELOPER_MODE,
    PARAM_LANGUAGE,
    PARAM_THEME,
} from '@gridsuite/commons-ui';
import { createTestContext } from 'test-utils/create-test-context';
import { server } from 'test-utils/msw/server';
import { LOCAL_STORAGE_THEME_KEY, saveLocalStorageLanguage, saveLocalStorageTheme } from '../../preferences.storage';
import { preferencesApi } from '../../preferences-api';
import { usePreference } from '../use-preference';

beforeEach(() => localStorage.clear());

describe('usePreference fallbacks', () => {
    it.each([
        [PARAM_THEME, DARK_THEME],
        [PARAM_LANGUAGE, LANG_SYSTEM],
        [PARAM_DEVELOPER_MODE, false],
    ] as const)('returns the default for %s when signed out', (name, expected) => {
        const { wrapper } = createTestContext({ authentication: { user: null } });
        const { result } = renderHook(() => usePreference(name), { wrapper });

        expect(result.current.value).toBe(expected);
        expect(result.current.isUpdating).toBe(false);
    });

    it('uses the locally stored theme when signed out', () => {
        saveLocalStorageTheme(LIGHT_THEME);
        const { wrapper } = createTestContext({ authentication: { user: null } });
        const { result } = renderHook(() => usePreference(PARAM_THEME), { wrapper });

        expect(result.current.value).toBe(LIGHT_THEME);
    });

    it('uses the locally stored language when signed out', () => {
        saveLocalStorageLanguage('fr');
        const { wrapper } = createTestContext({ authentication: { user: null } });
        const { result } = renderHook(() => usePreference(PARAM_LANGUAGE), { wrapper });

        expect(result.current.value).toBe('fr');
    });

    it('retains the local fallback when the backend has no value', async () => {
        saveLocalStorageTheme(LIGHT_THEME);
        server.use(
            http.get('*/config/v1/applications/common/parameters/theme', () => {
                return HttpResponse.json({ name: PARAM_THEME });
            })
        );
        const { wrapper, store } = createTestContext();
        const { result } = renderHook(() => usePreference(PARAM_THEME), { wrapper });

        await waitFor(() =>
            expect(
                preferencesApi.endpoints.getParameter.select({ appName: 'common', name: PARAM_THEME })(store.getState())
                    .isSuccess
            ).toBe(true)
        );
        expect(result.current.value).toBe(LIGHT_THEME);
    });
});

describe('usePreference backend reads', () => {
    it.each([
        [PARAM_THEME, LIGHT_THEME, LIGHT_THEME],
        [PARAM_LANGUAGE, 'fr', 'fr'],
        [PARAM_DEVELOPER_MODE, 'true', true],
        [PARAM_DEVELOPER_MODE, 'false', false],
    ] as const)('reads %s=%s from the authenticated common configuration', async (name, rawValue, expected) => {
        // Use a different fallback so the assertion must wait for the response.
        if (name === PARAM_THEME) {
            saveLocalStorageTheme(DARK_THEME);
        }
        if (name === PARAM_LANGUAGE) {
            saveLocalStorageLanguage('en');
        }
        let authorization: string | null = null;
        server.use(
            http.get(`*/config/v1/applications/common/parameters/${name}`, ({ request }) => {
                authorization = request.headers.get('authorization');
                return HttpResponse.json({ name, value: rawValue });
            })
        );
        const { wrapper, store } = createTestContext();
        const { result } = renderHook(() => usePreference(name), { wrapper });

        await waitFor(() => {
            // A false backend value equals the default; wait for the query to settle too.
            expect(
                preferencesApi.endpoints.getParameter.select({ appName: 'common', name })(store.getState()).isSuccess
            ).toBe(true);
            expect(result.current.value).toBe(expected);
        });
        expect(authorization).toBe('Bearer test-token');
        if (name === PARAM_THEME) {
            expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toBe(LIGHT_THEME);
        }
    });
});

describe('usePreference updates', () => {
    it.each(['success', 'failure'] as const)('updates optimistically and handles server %s', async (outcome) => {
        let completeRequest!: (response: Response) => void;
        const response = new Promise<Response>((resolve) => {
            completeRequest = resolve;
        });
        let submittedValue: string | null = null;
        server.use(
            http.get('*/config/v1/applications/common/parameters/theme', () =>
                HttpResponse.json({ name: PARAM_THEME, value: LIGHT_THEME })
            ),
            http.put('*/config/v1/applications/common/parameters/theme', ({ request }) => {
                submittedValue = new URL(request.url).searchParams.get('value');
                return response;
            })
        );
        const { wrapper } = createTestContext();
        const { result } = renderHook(() => usePreference(PARAM_THEME), { wrapper });
        await waitFor(() => expect(result.current.value).toBe(LIGHT_THEME));

        let updatePromise!: Promise<void>;
        act(() => {
            updatePromise = result.current.update(DARK_THEME);
        });

        expect(result.current.value).toBe(DARK_THEME);
        expect(result.current.isUpdating).toBe(true);
        await waitFor(() => expect(submittedValue).toBe(DARK_THEME));

        await act(async () => {
            const settlement =
                outcome === 'success'
                    ? expect(updatePromise).resolves.toBeUndefined()
                    : expect(updatePromise).rejects.toMatchObject({ status: 500 });
            completeRequest(
                outcome === 'success'
                    ? HttpResponse.json({})
                    : HttpResponse.json({ message: 'Update failed' }, { status: 500 })
            );
            await settlement;
        });

        await waitFor(() => {
            expect(result.current.value).toBe(outcome === 'success' ? DARK_THEME : LIGHT_THEME);
            expect(result.current.isUpdating).toBe(false);
        });
    });
});
