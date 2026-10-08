/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { initializeAuthenticationProd, logout, UserManagerState } from '@gridsuite/commons-ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestContext } from 'test-utils/create-test-context';
import { fetchIdpSettings } from '../../api/fetch-idp-settings';
import { useAuthentication } from '../use-authentication';

vi.mock('@gridsuite/commons-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gridsuite/commons-ui')>();
    return { ...actual, initializeAuthenticationProd: vi.fn(), logout: vi.fn() };
});

const manager = {} as NonNullable<UserManagerState['instance']>;

function renderAuthentication(path = '/') {
    const { wrapper: StoreProvider, store } = createTestContext();
    const wrapper = ({ children }: PropsWithChildren) => (
        <StoreProvider>
            <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
        </StoreProvider>
    );
    return { ...renderHook(() => useAuthentication(), { wrapper }), store };
}

describe('useAuthentication', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(initializeAuthenticationProd).mockResolvedValue(manager);
        vi.mocked(logout).mockResolvedValue(undefined);
    });

    it.each([
        ['/', false, false],
        ['/silent-renew-callback', true, false],
        ['/sign-in-callback', false, true],
    ])('initializes authentication for %s', async (path, isSilentRenew, isSignInCallback) => {
        const { result, store } = renderAuthentication(path);
        await waitFor(() => expect(result.current.userManager.instance).toBe(manager));
        expect(initializeAuthenticationProd).toHaveBeenCalledWith(
            store.dispatch,
            isSilentRenew,
            fetchIdpSettings,
            isSignInCallback
        );
    });

    it('exposes initialization errors to the authentication UI', async () => {
        vi.mocked(initializeAuthenticationProd).mockRejectedValue(new Error('IDP unavailable'));
        const { result } = renderAuthentication();
        await waitFor(() => expect(result.current.userManager.error).toBe('IDP unavailable'));
        expect(result.current.userManager.instance).toBeNull();
    });

    it('logs out through the initialized manager', async () => {
        const { result, store } = renderAuthentication();
        await waitFor(() => expect(result.current.userManager.instance).toBe(manager));
        await act(async () => result.current.onLogoutClick());
        expect(logout).toHaveBeenCalledWith(store.dispatch, manager);
    });
});
