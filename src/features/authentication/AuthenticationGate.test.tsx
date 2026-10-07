/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { createTestContext } from 'test-utils/create-test-context';
import { AuthenticationGate } from './AuthenticationGate';

vi.mock('@gridsuite/commons-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gridsuite/commons-ui')>();
    return { ...actual, AuthenticationRouter: () => <div>Sign in</div> };
});

describe('AuthenticationGate', () => {
    it('shows application content for an authenticated user', () => {
        const { wrapper } = createTestContext();
        render(
            <MemoryRouter>
                <AuthenticationGate userManager={{ instance: null, error: null }}>
                    <div>Protected content</div>
                </AuthenticationGate>
            </MemoryRouter>,
            { wrapper }
        );
        expect(screen.getByText('Protected content')).toBeInTheDocument();
        expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    });

    it('shows authentication UI without exposing application content when logged out', () => {
        const { wrapper } = createTestContext({ authentication: { user: null } });
        render(
            <MemoryRouter>
                <AuthenticationGate userManager={{ instance: null, error: null }}>
                    <div>Protected content</div>
                </AuthenticationGate>
            </MemoryRouter>,
            { wrapper }
        );
        expect(screen.getByText('Sign in')).toBeInTheDocument();
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    });
});
