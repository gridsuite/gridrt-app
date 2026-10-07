/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from 'test-utils/msw/server';
import App from './App';

vi.mock('@gridsuite/commons-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gridsuite/commons-ui')>();
    return {
        ...actual,
        initializeAuthenticationProd: vi.fn().mockRejectedValue(new Error('IDP unavailable')),
        AuthenticationRouter: ({ userManager }: { userManager: { error: string | null } }) => (
            <div>{userManager.error ?? 'Signing in'}</div>
        ),
    };
});

it('composes providers, layout and authentication at the application entry point', async () => {
    server.use(
        http.get('*/env.json', () => HttpResponse.json({ appsMetadataServerUrl: 'http://localhost:8070' })),
        http.get('http://localhost:8070/version.json', () => HttpResponse.json({ deployVersion: 'test-version' }))
    );
    render(<App />);
    expect(await screen.findByRole('complementary')).toBeInTheDocument();
    expect(await screen.findByText('IDP unavailable')).toBeInTheDocument();
});
