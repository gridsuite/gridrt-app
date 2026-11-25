/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ComponentProps } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { appMessages } from 'app/config/app-messages';
import { createTestContext } from 'test-utils/create-test-context';
import { server } from 'test-utils/msw/server';
import { snackRef } from 'shared/lib/snack-ref';
import ModificationsConfiguration from '../ModificationsConfiguration';

vi.mock('@gridsuite/commons-ui', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@gridsuite/commons-ui')>()),
    NetworkModificationsTable: ({
        modifications,
        isFetchingModifications,
    }: ComponentProps<typeof import('@gridsuite/commons-ui').NetworkModificationsTable>) => (
        <div data-testid="modifications-table" data-loading={isFetchingModifications}>
            {JSON.stringify(modifications)}
        </div>
    ),
}));

const endpoint = 'http://localhost/api/gateway/snapshot-refiner/v1/configuration/modifications';
const targetSteps = [
    'ESTIM_MODIFICATIONS',
    'LOADFLOW_MODIFICATIONS',
    'ESTIM_FALLBACK_MODIFICATIONS',
    'LOADFLOW_FALLBACK_ESTIM_MODIFICATIONS',
    'LOADFLOW_FALLBACK_LOADFLOW_MODIFICATIONS',
];

function renderConfiguration() {
    const context = createTestContext();
    render(
        <IntlProvider locale="en" messages={appMessages.en}>
            <ModificationsConfiguration />
        </IntlProvider>,
        { wrapper: context.wrapper }
    );
    return context;
}

describe('ModificationsConfiguration', () => {
    it('requests the selected target step on every click and passes the returned list to the table', async () => {
        const user = userEvent.setup();
        const requests: { targetStep: string | null; authorization: string | null }[] = [];
        server.use(
            http.get(endpoint, ({ request }) => {
                const targetStep = new URL(request.url).searchParams.get('targetStep');
                requests.push({ targetStep, authorization: request.headers.get('Authorization') });
                return HttpResponse.json([{ uuid: targetStep, messageValues: 'Returned modification' }]);
            })
        );
        renderConfiguration();

        expect(requests).toHaveLength(0);
        expect(screen.getByTestId('modifications-table')).toHaveTextContent('[]');

        await [0, 1, 2, 3, 4, 0].reduce(async (previousClick, index) => {
            await previousClick;
            await user.click(screen.getAllByRole('button')[index]);
            await waitFor(() =>
                expect(screen.getByTestId('modifications-table').textContent).toBe(
                    JSON.stringify([{ uuid: targetSteps[index], messageValues: 'Returned modification' }])
                )
            );
        }, Promise.resolve());

        await waitFor(() =>
            expect(requests).toEqual(
                [...targetSteps, targetSteps[0]].map((targetStep) => ({
                    targetStep,
                    authorization: 'Bearer test-token',
                }))
            )
        );
    });

    it('keeps the latest selection when an earlier request completes later', async () => {
        const user = userEvent.setup();
        let resolveFirstRequest!: () => void;
        const firstRequest = new Promise<void>((resolve) => {
            resolveFirstRequest = resolve;
        });
        server.use(
            http.get(endpoint, async ({ request }) => {
                const targetStep = new URL(request.url).searchParams.get('targetStep');
                if (targetStep === targetSteps[0]) {
                    await firstRequest;
                }
                return HttpResponse.json([{ uuid: targetStep }]);
            })
        );
        const { store } = renderConfiguration();

        await user.click(screen.getAllByRole('button')[0]);
        expect(screen.getByTestId('modifications-table')).toHaveAttribute('data-loading', 'true');
        await user.click(screen.getAllByRole('button')[1]);
        await waitFor(() =>
            expect(screen.getByTestId('modifications-table').textContent).toBe(
                JSON.stringify([{ uuid: targetSteps[1] }])
            )
        );

        resolveFirstRequest();
        await waitFor(() =>
            expect(
                Object.values(store.getState().snapshotRefinerApi.queries).filter(
                    (query) => query?.status === 'fulfilled'
                )
            ).toHaveLength(2)
        );
        expect(screen.getByTestId('modifications-table').textContent).toBe(JSON.stringify([{ uuid: targetSteps[1] }]));
    });

    it('clears the previous list and reports errors when the selected step cannot be loaded', async () => {
        const user = userEvent.setup();
        const snackError = vi.spyOn(snackRef, 'error');
        server.use(
            http.get(endpoint, ({ request }) =>
                new URL(request.url).searchParams.get('targetStep') === targetSteps[0]
                    ? HttpResponse.json([{ uuid: targetSteps[0] }])
                    : HttpResponse.json({ message: 'Failed to load modifications' }, { status: 500 })
            )
        );
        renderConfiguration();

        await user.click(screen.getAllByRole('button')[0]);
        await waitFor(() => expect(screen.getByTestId('modifications-table')).toHaveTextContent(targetSteps[0]));
        await user.click(screen.getAllByRole('button')[1]);
        await waitFor(() =>
            expect(snackError).toHaveBeenCalledWith(
                expect.objectContaining({ headerId: 'getConfigurationModifications' })
            )
        );
        expect(screen.getByTestId('modifications-table')).toHaveTextContent('[]');
        expect(screen.getByTestId('modifications-table')).toHaveAttribute('data-loading', 'false');
        snackError.mockRestore();
    });
});
