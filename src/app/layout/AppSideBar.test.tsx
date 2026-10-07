/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DARK_THEME, LIGHT_THEME, PARAM_DEVELOPER_MODE, PARAM_LANGUAGE, PARAM_THEME } from '@gridsuite/commons-ui';
import { createTestContext } from 'test-utils/create-test-context';
import { AppSideBar } from './AppSideBar';

const mocks = vi.hoisted(() => ({
    commonAppSideBar: vi.fn(),
    fetchAppsMetadata: vi.fn(),
    fetchDeploymentVersion: vi.fn(),
    fetchBackendModules: vi.fn(),
    usePreference: vi.fn(),
    useUserIdentity: vi.fn(),
}));

vi.mock('@gridsuite/commons-ui', async (importOriginal) => {
    const original = await importOriginal<typeof import('@gridsuite/commons-ui')>();

    return {
        ...original,
        AppSideBar: (props: unknown) => {
            mocks.commonAppSideBar(props);
            return null;
        },
        fetchAppsMetadata: mocks.fetchAppsMetadata,
    };
});

vi.mock('features/preferences/hooks/use-preference', () => ({
    usePreference: mocks.usePreference,
}));

vi.mock('features/authentication', () => ({
    useUserIdentity: mocks.useUserIdentity,
    useUserProfile: mocks.useUserIdentity,
}));

vi.mock('features/about/api/fetch-deployment-version', () => ({
    fetchDeploymentVersion: mocks.fetchDeploymentVersion,
}));

vi.mock('features/about/api/fetch-backend-modules', () => ({
    fetchBackendModules: mocks.fetchBackendModules,
}));

describe('AppSideBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.fetchAppsMetadata.mockResolvedValue([{ name: 'Study', url: 'http://study.local' }]);
        mocks.fetchDeploymentVersion.mockResolvedValue({
            deployVersion: 'test-version',
        });
        mocks.fetchBackendModules.mockResolvedValue([]);
        mocks.useUserIdentity.mockReturnValue(null);

        mocks.usePreference.mockImplementation((paramName: string) => {
            switch (paramName) {
                case PARAM_THEME:
                    return { value: LIGHT_THEME, update: vi.fn(), isUpdating: false };
                case PARAM_LANGUAGE:
                    return { value: 'en', update: vi.fn(), isUpdating: false };
                case PARAM_DEVELOPER_MODE:
                    return { value: false, update: vi.fn(), isUpdating: false };
                default:
                    return { value: undefined, update: vi.fn(), isUpdating: false };
            }
        });
    });

    it('passes the inverted dark theme when the application theme is light', async () => {
        render(<AppSideBar />, { wrapper: createTestContext().wrapper });

        await waitFor(() => {
            expect(mocks.commonAppSideBar).toHaveBeenCalledWith(
                expect.objectContaining({
                    currentTheme: LIGHT_THEME,
                    sideBarTheme: expect.objectContaining({
                        palette: expect.objectContaining({
                            mode: 'dark',
                        }),
                    }),
                })
            );
        });
    });

    it('passes the inverted light theme when the application theme is dark', () => {
        mocks.usePreference.mockImplementation((paramName: string) => {
            switch (paramName) {
                case PARAM_THEME:
                    return { value: 'Dark', update: vi.fn(), isUpdating: false };
                case PARAM_LANGUAGE:
                    return { value: 'fr', update: vi.fn(), isUpdating: false };
                case PARAM_DEVELOPER_MODE:
                    return { value: true, update: vi.fn(), isUpdating: false };
                default:
                    return { value: undefined, update: vi.fn(), isUpdating: false };
            }
        });

        render(<AppSideBar />, { wrapper: createTestContext().wrapper });

        expect(mocks.commonAppSideBar).toHaveBeenCalledWith(
            expect.objectContaining({
                currentTheme: DARK_THEME,
                selectedLanguage: 'fr',
                isDeveloperMode: true,
                sideBarTheme: expect.objectContaining({
                    palette: expect.objectContaining({
                        mode: 'light',
                    }),
                }),
            })
        );
    });

    it('loads application metadata when a user is authenticated', async () => {
        mocks.useUserIdentity.mockReturnValue({
            sub: 'test-user',
        });

        render(<AppSideBar />, { wrapper: createTestContext().wrapper });

        await waitFor(() => {
            expect(mocks.fetchAppsMetadata).toHaveBeenCalledTimes(1);
        });
    });

    it('does not load application metadata when no authenticated user is available', () => {
        mocks.useUserIdentity.mockReturnValue(null);

        render(<AppSideBar />, { wrapper: createTestContext().wrapper });

        expect(mocks.fetchAppsMetadata).not.toHaveBeenCalled();
    });
});
