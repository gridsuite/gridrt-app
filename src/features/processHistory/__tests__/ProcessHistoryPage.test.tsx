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
import { DownloadCaseDialog } from '../components/DownloadCaseDialog';
import type { ProcessExecutionInfo } from '../model/process-execution-info';
import { ProcessStepType, Status } from '../../../shared/api/snapshot-refiner-api';

const mocks = vi.hoisted(() => ({
    deleteProcess: vi.fn(),
    downloadResultCase: vi.fn(),
    duplicateExistingCase: vi.fn(),
    executions: [] as ProcessExecutionInfo[],
    refresh: vi.fn(),
    snackInfo: vi.fn(),
    snackSuccess: vi.fn(),
    snackError: vi.fn(),
    tableProps: null as ComponentProps<typeof ProcessHistoryTable> | null,
    downloadDialogProps: null as ComponentProps<typeof DownloadCaseDialog> | null,
}));
const deletedProcess = { caseDeletionStatus: 'SUCCESSFUL', reportDeletionStatus: 'NOTHING_TO_DELETE' };

vi.mock('features/processHistory/hooks/use-process-list', () => ({
    useProcessResults: () => ({ executions: mocks.executions, isLoading: false, refresh: mocks.refresh }),
}));
vi.mock('shared/api/snapshot-refiner-api', async (importOriginal) => ({
    ...(await importOriginal<typeof import('shared/api/snapshot-refiner-api')>()),
    useDeleteProcessExecutionMutation: () => [mocks.deleteProcess],
    useDownloadResultCaseMutation: () => [mocks.downloadResultCase],
}));
vi.mock('shared/api/explore-api', async (importOriginal) => ({
    ...(await importOriginal<typeof import('shared/api/explore-api')>()),
    useDuplicateExistingCaseMutation: () => [mocks.duplicateExistingCase],
}));
vi.mock('@gridsuite/commons-ui', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@gridsuite/commons-ui')>()),
    useSnackMessage: () => ({
        snackInfo: mocks.snackInfo,
        snackSuccess: mocks.snackSuccess,
        snackError: mocks.snackError,
    }),
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
vi.mock('features/processHistory/components/DownloadCaseDialog', () => ({
    DownloadCaseDialog: (props: ComponentProps<typeof DownloadCaseDialog>) => {
        mocks.downloadDialogProps = props;
        return <div data-testid="download-dialog" />;
    },
}));

describe('ProcessHistoryPage selection actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.executions = [];
        mocks.tableProps = null;
        mocks.downloadDialogProps = null;
        mocks.refresh.mockResolvedValue(undefined);
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

    it('downloads the result case locally', async () => {
        mocks.downloadResultCase.mockReturnValue({
            unwrap: () => Promise.resolve('Case 1.biidm'),
        });
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );
        act(() => mocks.tableProps?.onDownloadClick('process-1', 'Case 1'));
        await act(async () => {
            mocks.downloadDialogProps?.onDownload(
                {},
                {
                    fileName: 'Case 1',
                    exportToGridExplore: false,
                    selectedFormat: '',
                    selectedCompression: '',
                }
            );
        });
        expect(mocks.downloadResultCase).toHaveBeenCalledWith({
            processUuid: 'process-1',
            fileNameInput: 'Case 1',
        });
        expect(mocks.duplicateExistingCase).not.toHaveBeenCalled();
    });

    it('duplicates the result case in GridExplore', async () => {
        mocks.executions = [
            {
                processUuid: 'process-1',
                executionSteps: [
                    {
                        processStepType: ProcessStepType.CaseSaving,
                        status: Status.Completed,
                        resultUuid: 'result-1',
                    },
                ],
            },
        ];
        mocks.duplicateExistingCase.mockReturnValue({
            unwrap: () => Promise.resolve(undefined),
        });
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );
        act(() => mocks.tableProps?.onDownloadClick('process-1', 'Case 1'));
        await act(async () => {
            mocks.downloadDialogProps?.onDownload(
                {},
                {
                    fileName: 'Case 1',
                    exportToGridExplore: true,
                    parentDirectoryUuid: 'directory-1',
                    description: 'Description',
                    selectedFormat: '',
                    selectedCompression: '',
                }
            );
        });
        expect(mocks.duplicateExistingCase).toHaveBeenCalledWith({
            sourceCaseUuid: 'result-1',
            caseName: 'Case 1',
            parentDirectoryUuid: 'directory-1',
            description: 'Description',
        });
        expect(mocks.downloadResultCase).not.toHaveBeenCalled();
    });

    it('closes the download dialog when the download starts', async () => {
        let resolveDownload: () => void = () => {};
        mocks.downloadResultCase.mockReturnValue({
            unwrap: () =>
                new Promise<void>((resolve) => {
                    resolveDownload = resolve;
                }),
        });
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );
        act(() => mocks.tableProps?.onDownloadClick('process-1', 'Case 1'));
        expect(screen.getByTestId('download-dialog')).toBeInTheDocument();
        await act(async () => {
            mocks.downloadDialogProps!.onDownload(
                {},
                {
                    fileName: 'Case 1',
                    exportToGridExplore: false,
                    selectedFormat: '',
                    selectedCompression: '',
                }
            );

            await Promise.resolve();
        });
        expect(screen.queryByRole('download-dialog')).not.toBeInTheDocument();
        expect(mocks.downloadResultCase).toHaveBeenCalledWith({
            processUuid: 'process-1',
            fileNameInput: 'Case 1',
        });
        await act(async () => {
            resolveDownload();
            await Promise.resolve();
        });
    });

    it('does not download to GridExplore when no completed case saving result exists', async () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );
        act(() => mocks.tableProps?.onDownloadClick('process-1', 'Case 1'));
        await act(async () => {
            mocks.downloadDialogProps?.onDownload(
                {},
                {
                    fileName: 'Case 1',
                    exportToGridExplore: true,
                    parentDirectoryUuid: 'directory-1',
                    selectedFormat: '',
                    selectedCompression: '',
                }
            );
        });
        expect(mocks.downloadResultCase).not.toHaveBeenCalled();
        expect(mocks.duplicateExistingCase).not.toHaveBeenCalled();
        expect(mocks.snackError).toHaveBeenCalledOnce();
        expect(mocks.snackInfo).not.toHaveBeenCalled();
    });

    it('does not download to GridExplore when no parent directory is provided', async () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryPage />
            </IntlProvider>
        );
        act(() => mocks.tableProps?.onDownloadClick('process-1', 'Case 1'));
        await act(async () => {
            mocks.downloadDialogProps?.onDownload(
                {},
                {
                    fileName: 'Case 1',
                    exportToGridExplore: true,
                    selectedFormat: '',
                    selectedCompression: '',
                }
            );
        });
        expect(mocks.downloadResultCase).not.toHaveBeenCalled();
        expect(mocks.duplicateExistingCase).not.toHaveBeenCalled();
        expect(mocks.snackError).toHaveBeenCalledOnce();
    });
});
