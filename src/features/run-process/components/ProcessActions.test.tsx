/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { File as NodeFile } from 'node:buffer';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createUiTestContext } from 'test-utils/create-ui-test-context';
import { server } from 'test-utils/msw/server';
import { ProcessActions } from './ProcessActions';

function renderActions(isAuthenticated = true) {
    const user = userEvent.setup();
    const { wrapper } = createUiTestContext();
    render(<ProcessActions isAuthenticated={isAuthenticated} />, { wrapper });
    return user;
}

async function openLaunchDialog(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('switch', { name: 'Sandbox mode' }));
    await user.click(screen.getByRole('button', { name: 'Run process' }));
}

describe('ProcessActions', () => {
    afterEach(() => vi.unstubAllGlobals());
    it('hides process controls when unauthenticated', () => {
        renderActions(false);
        expect(screen.queryByRole('switch')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Run process' })).not.toBeInTheDocument();
    });

    it('opens the dialog in sandbox mode and resets file selection after closing', async () => {
        const user = renderActions();
        expect(screen.queryByRole('button', { name: 'Run process' })).not.toBeInTheDocument();
        await openLaunchDialog(user);
        expect(screen.getByRole('button', { name: 'Launch' })).toBeDisabled();
        await user.upload(screen.getByTestId('case-file-input'), new File(['network'], 'case.xiidm'));
        expect(screen.getByRole('button', { name: 'Launch' })).toBeEnabled();
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        await user.click(screen.getByRole('button', { name: 'Run process' }));
        expect(screen.getByRole('button', { name: 'Launch' })).toBeDisabled();
        expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('rejects an unsupported case file without enabling launch', async () => {
        const user = renderActions();
        await openLaunchDialog(user);
        await user.upload(screen.getByTestId('case-file-input'), new File(['content'], 'case.txt'));
        expect(screen.getByTestId('case-file-error')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Launch' })).toBeDisabled();
    });

    it('uploads the selected case and shows launch success', async () => {
        // MSW uses Node's fetch: its multipart encoder needs matching native file types.
        const nativeForm = await new Request('http://localhost', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: '',
        }).formData();
        vi.stubGlobal('FormData', nativeForm.constructor);
        vi.stubGlobal('File', NodeFile);
        let uploadedBody = '';
        let contentType: string | null = null;
        let authorization: string | null = null;
        server.use(
            http.post('*/snapshot-refiner/v1/run', async ({ request }) => {
                authorization = request.headers.get('authorization');
                contentType = request.headers.get('content-type');
                uploadedBody = await request.text();
                return HttpResponse.json('process-id');
            })
        );
        const user = renderActions();
        await openLaunchDialog(user);
        await user.upload(screen.getByTestId('case-file-input'), new File(['network'], 'case.xiidm'));
        await user.click(screen.getByRole('button', { name: 'Launch' }));
        expect(await screen.findByText('Process launched')).toBeInTheDocument();
        expect(contentType).toContain('multipart/form-data; boundary=');
        expect(uploadedBody).toContain('name="caseFile"; filename="case.xiidm"');
        expect(uploadedBody).toContain('network');
        expect(authorization).toBe('Bearer test-token');
    });
});
