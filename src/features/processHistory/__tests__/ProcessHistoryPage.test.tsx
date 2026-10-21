/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import ProcessHistoryPage from 'features/processHistory/pages/ProcessHistoryPage';
import messages from 'shared/translations/en/common.json';
import type ProcessHistoryTable from 'features/processHistory/pages/ProcessHistoryTable';

const mocks = vi.hoisted(() => ({
    deleteProcess: vi.fn(),
    refresh: vi.fn(),
    tableProps: null as ComponentProps<typeof ProcessHistoryTable> | null,
}));
const deletedProcess = { caseDeletionStatus: 'SUCCESSFUL', reportDeletionStatus: 'NOTHING_TO_DELETE' };

vi.mock('features/processHistory/hooks/use-process-list', () => ({
    useProcessResults: () => ({ executions: [], isLoading: false, refresh: mocks.refresh }),
}));
vi.mock('shared/api/snapshot-refiner-api', async (importOriginal) => ({
    ...(await importOriginal<typeof import('shared/api/snapshot-refiner-api')>()),
    useDeleteProcessExecutionMutation: () => [mocks.deleteProcess],
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
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.tableProps = null;
    });
    it('shows the selected count and actions beside the title only when rows are selected', () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );

        expect(screen.getByText('Process history')).toBeInTheDocument();
        expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

        act(() => mocks.tableProps?.onSelectionChange(['process-1']));
        expect(screen.getByText('1 element selected')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();

        act(() => mocks.tableProps?.onSelectionChange(['process-1', 'process-2']));
        expect(screen.getByText('2 elements selected')).toBeInTheDocument();

        act(() => mocks.tableProps?.onSelectionChange([]));
        expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('clears grid selection when Cancel is clicked', () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );

        act(() => mocks.tableProps?.onSelectionChange(['process-1', 'process-2']));
        mocks.tableProps!.gridRef.current = {
            api: {
                deselectAll: () => {
                    mocks.tableProps?.onSelectionChange([]);
                },
            },
        } as never;
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByText('2 elements selected')).not.toBeInTheDocument();
    });

    it('opens and dismisses the confirmation dialog from the toolbar and from a row', async () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );

        mocks.tableProps!.gridRef.current = {
            api: { getSelectedRows: () => [{ processUuid: 'process-1' }, { processUuid: 'process-2' }] },
        } as never;
        act(() => mocks.tableProps?.onSelectionChange(['process-1', 'process-2']));
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(screen.getByRole('dialog', { name: 'Delete 2 processes' })).toBeInTheDocument();
        expect(
            screen.getByText('These processes will be deleted permanently. Their data will be lost.')
        ).toBeInTheDocument();
        expect(screen.getByRole('dialog').querySelectorAll('button')).toHaveLength(2);
        expect(screen.getByRole('dialog').querySelectorAll('button')[1]).toBeEnabled();
        fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[0]);
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(screen.getByText('2 elements selected')).toBeInTheDocument();

        act(() => mocks.tableProps?.onDeleteProcess('process-1'));
        expect(screen.getByRole('dialog', { name: 'Delete the process' })).toBeInTheDocument();
        expect(screen.getByText('2 elements selected')).toBeInTheDocument();
        expect(
            screen.getByText('This process will be deleted permanently. Its data will be lost.')
        ).toBeInTheDocument();
    });

    it('uses the singular title when the toolbar deletes one selected process', () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );

        mocks.tableProps!.gridRef.current = {
            api: { getSelectedRows: () => [{ processUuid: 'process-1' }] },
        } as never;
        act(() => mocks.tableProps?.onSelectionChange(['process-1']));
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(screen.getByRole('dialog', { name: 'Delete the process' })).toBeInTheDocument();
        expect(
            screen.getByText('This process will be deleted permanently. Its data will be lost.')
        ).toBeInTheDocument();
    });

    it('deletes only the row clicked and refreshes the list', async () => {
        mocks.deleteProcess.mockImplementation(() => ({ unwrap: () => Promise.resolve(deletedProcess) }));
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );

        act(() => mocks.tableProps?.onDeleteProcess('process-1'));
        fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[1]);
        await waitFor(() => expect(mocks.deleteProcess).toHaveBeenCalledWith({ processUuid: 'process-1' }));
        expect(mocks.deleteProcess).toHaveBeenCalledOnce();
        await waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
    });

    it('deletes the selected UUIDs captured when the toolbar dialog opens', async () => {
        mocks.deleteProcess.mockImplementation(() => ({ unwrap: () => Promise.resolve(deletedProcess) }));
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );
        let selected = [{ processUuid: 'process-1' }, { processUuid: 'process-2' }];
        mocks.tableProps!.gridRef.current = {
            api: { getSelectedRows: () => selected },
        } as never;
        act(() => mocks.tableProps?.onSelectionChange(['process-1', 'process-2']));
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        selected = [{ processUuid: 'process-3' }];
        act(() => mocks.tableProps?.onSelectionChange(['process-3']));
        expect(screen.getByRole('dialog', { name: 'Delete 2 processes' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[1]);
        await waitFor(() => expect(mocks.deleteProcess).toHaveBeenCalledTimes(2));
        expect(mocks.deleteProcess).toHaveBeenCalledWith({ processUuid: 'process-1' });
        expect(mocks.deleteProcess).toHaveBeenCalledWith({ processUuid: 'process-2' });
        await waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
    });

    it('refreshes, deselects and closes when a deletion reports partial failure', async () => {
        mocks.deleteProcess.mockImplementation(({ processUuid }: { processUuid: string }) => ({
            unwrap: () =>
                Promise.resolve(
                    processUuid === 'process-2' ? { ...deletedProcess, caseDeletionStatus: 'FAILED' } : deletedProcess
                ),
        }));
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );
        mocks.tableProps!.gridRef.current = {
            api: {
                getSelectedRows: () => [{ processUuid: 'process-1' }, { processUuid: 'process-2' }],
            },
        } as never;
        act(() => mocks.tableProps?.onSelectionChange(['process-1', 'process-2']));
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[1]);
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(mocks.refresh).toHaveBeenCalledOnce();
        expect(mocks.deleteProcess).toHaveBeenCalledTimes(2);
    });

    it('closes and clears selection after a rejected request without issuing a second request while pending', async () => {
        let rejectRequest: (error: Error) => void = () => {};
        mocks.deleteProcess.mockImplementation(() => ({
            unwrap: () =>
                new Promise((_, reject) => {
                    rejectRequest = reject;
                }),
        }));
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );
        act(() => mocks.tableProps?.onDeleteProcess('process-1'));
        fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[1]);
        expect(screen.getByRole('dialog').querySelectorAll('button')[1]).toBeDisabled();
        fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[1]);
        expect(mocks.deleteProcess).toHaveBeenCalledOnce();

        await act(async () => rejectRequest(new Error('Request failed')));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(mocks.refresh).toHaveBeenCalledOnce();
    });

    it('closes even when a step result could not be deleted', async () => {
        mocks.deleteProcess.mockImplementation(() => ({
            unwrap: () => Promise.resolve({ ...deletedProcess, executionSteps: [{ resultDeletionStatus: 'FAILED' }] }),
        }));
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );
        act(() => mocks.tableProps?.onDeleteProcess('process-1'));
        fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[1]);
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(mocks.refresh).toHaveBeenCalledOnce();
    });
});
