/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import ProcessHistoryPage from 'features/processHistory/pages/ProcessHistoryPage';
import messages from 'shared/translations/en/common.json';
import type ProcessHistoryTable from 'features/processHistory/pages/ProcessHistoryTable';

const mocks = vi.hoisted(() => ({
    deselectAll: vi.fn(),
    tableProps: null as ComponentProps<typeof ProcessHistoryTable> | null,
}));

vi.mock('features/processHistory/hooks/use-process-list', () => ({
    useProcessResults: () => ({ executions: [], isLoading: false }),
}));
vi.mock('features/processHistory/components/process-history-sort-provider', () => ({
    ProcessHistorySortProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('features/processHistory/components/process-history-filter-provider', () => ({
    ProcessHistoryFilterProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('features/processHistory/pages/ProcessHistoryTable', () => ({
    default: (props: ComponentProps<typeof ProcessHistoryTable>) => {
        mocks.tableProps = props;
        return <div data-testid="process-grid" />;
    },
}));

describe('ProcessHistoryPage selection actions', () => {
    it('shows the selected count and actions beside the title only when rows are selected', () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );

        expect(screen.getByText('Process history')).toBeInTheDocument();
        expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

        act(() => mocks.tableProps?.onSelectionChange(1));
        expect(screen.getByText('1 element selected')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();

        act(() => mocks.tableProps?.onSelectionChange(2));
        expect(screen.getByText('2 elements selected')).toBeInTheDocument();

        act(() => mocks.tableProps?.onSelectionChange(0));
        expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('clears grid selection when Cancel is clicked', () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );

        act(() => mocks.tableProps?.onSelectionChange(2));
        mocks.tableProps!.gridRef.current = {
            api: {
                deselectAll: () => {
                    mocks.deselectAll();
                    mocks.tableProps?.onSelectionChange(0);
                },
            },
        } as never;
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mocks.deselectAll).toHaveBeenCalledOnce();
        expect(screen.queryByText('2 elements selected')).not.toBeInTheDocument();
    });

    it('opens and dismisses the confirmation dialog from the toolbar and from a row', async () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );

        act(() => mocks.tableProps?.onSelectionChange(2));
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(screen.getByRole('dialog', { name: 'Delete 2 processes' })).toBeInTheDocument();
        expect(
            screen.getByText('these processes will be deleted permanently. Their data will be lost.')
        ).toBeInTheDocument();
        expect(screen.getByRole('dialog').querySelectorAll('button')).toHaveLength(2);
        expect(screen.getByRole('dialog').querySelectorAll('button')[1]).toBeDisabled();
        fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[0]);
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(screen.getByText('2 elements selected')).toBeInTheDocument();

        act(() => mocks.tableProps?.onDeleteProcess());
        expect(screen.getByRole('dialog', { name: 'Delete the process' })).toBeInTheDocument();
        expect(
            screen.getByText('this process will be deleted permanently. Its data will be lost.')
        ).toBeInTheDocument();
    });

    it('uses the singular title when the toolbar deletes one selected process', () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );

        act(() => mocks.tableProps?.onSelectionChange(1));
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(screen.getByRole('dialog', { name: 'Delete the process' })).toBeInTheDocument();
        expect(
            screen.getByText('this process will be deleted permanently. Its data will be lost.')
        ).toBeInTheDocument();
    });
});
