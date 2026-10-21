/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';
import { ProcessActionsCellRenderer } from 'features/processHistory/components/renderers/process-actions-cell-renderer';
import { Status } from 'shared/api/snapshot-refiner-api';
import messages from 'shared/translations/en/common.json';

vi.mock('shared/api/snapshot-refiner-api', async (importOriginal) => ({
    ...(await importOriginal<typeof import('shared/api/snapshot-refiner-api')>()),
    useDownloadResultCaseMutation: () => [vi.fn()],
}));

describe('ProcessActionsCellRenderer', () => {
    it('opens the confirmation dialog through the row delete button', () => {
        const onDeleteProcess = vi.fn();
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessActionsCellRenderer
                    processUuid="process-1"
                    caseName="Case"
                    status={Status.Completed}
                    onDeleteProcess={onDeleteProcess}
                />
            </IntlProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Delete process' }));
        expect(onDeleteProcess).toHaveBeenCalledWith('process-1');
    });
});
