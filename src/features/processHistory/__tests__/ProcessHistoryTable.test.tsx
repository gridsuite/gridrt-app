/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import ProcessHistoryTable from 'features/processHistory/pages/ProcessHistoryTable';
import messages from 'shared/translations/en/common.json';

const captured = vi.hoisted(() => ({ props: null as AgGridReactProps | null }));

vi.mock('@gridsuite/commons-ui', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@gridsuite/commons-ui')>()),
    CustomAGGrid: (props: AgGridReactProps) => {
        captured.props = props;
        return <div data-testid="process-grid" />;
    },
    useCustomAggridFilterContext: () => ({ getFilters: () => undefined }),
    useCustomAggridSortContext: () => ({ getSortConfig: () => undefined }),
    updateAgGridFilters: vi.fn(),
}));

describe('ProcessHistoryTable selection', () => {
    it('uses a left-hand checkbox column with a select-all header and stable row ids', () => {
        const onSelectionChange = vi.fn();
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryTable
                    executions={[{ processUuid: 'process-1' }]}
                    isLoading={false}
                    gridRef={createRef<AgGridReact>()}
                    onSelectionChange={onSelectionChange}
                    onDeleteProcess={vi.fn()}
                />
            </IntlProvider>
        );

        expect(screen.getByTestId('process-grid')).toBeInTheDocument();
        expect(captured.props?.rowSelection).toEqual({
            mode: 'multiRow',
            checkboxes: true,
            headerCheckbox: true,
            selectAll: 'filtered',
            enableClickSelection: false,
            isRowSelectable: expect.any(Function),
        });
        expect(captured.props?.selectionColumnDef).toMatchObject({ width: 32 });
        expect(captured.props?.getRowId?.({ data: { processUuid: 'process-1' } } as never)).toBe('process-1');
    });

    it('shows row checkboxes while any row is selected, and hides them again when deselected', () => {
        const onSelectionChange = vi.fn();
        const gridRef = createRef<AgGridReact>();
        const { container, rerender } = render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryTable
                    executions={[{ processUuid: 'process-1' }]}
                    isLoading={false}
                    gridRef={gridRef}
                    onSelectionChange={onSelectionChange}
                    onDeleteProcess={vi.fn()}
                />
            </IntlProvider>
        );
        const wrapper = container.firstElementChild;
        const initialClass = wrapper?.className;

        expect(document.head.textContent).toContain('.ag-row:hover .ag-selection-checkbox');
        expect(document.head.textContent).toContain('.ag-header-cell:hover .ag-header-select-all');
        expect(document.head.textContent).toContain('.ag-header-select-all:has(input:checked){visibility:visible;}');
        expect(document.head.textContent).toContain(
            '.ag-header-select-all:has(input:indeterminate){visibility:visible;}'
        );
        expect(document.head.textContent).not.toContain('.ag-header-cell:has(:focus-visible) .ag-header-select-all');
        expect(document.head.textContent).toContain('.ag-row:hover .process-delete-icon');
        expect(document.head.textContent).toContain('.ag-row:has(:focus-visible) .ag-selection-checkbox');
        expect(document.head.textContent).toContain('.ag-row:has(:focus-visible) .process-delete-icon');
        expect(document.head.textContent).not.toContain('.ag-row:focus-within');

        act(() =>
            captured.props?.onSelectionChanged?.({
                api: { getSelectedRows: () => [{ processUuid: 'process-1' }, { processUuid: 'process-2' }] },
            } as never)
        );
        expect(onSelectionChange).toHaveBeenLastCalledWith(['process-1', 'process-2']);
        rerender(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryTable
                    executions={[{ processUuid: 'process-1' }]}
                    isLoading={false}
                    gridRef={gridRef}
                    onSelectionChange={onSelectionChange}
                    onDeleteProcess={vi.fn()}
                />
            </IntlProvider>
        );
        expect(wrapper?.className).toBe(initialClass);
        const selectedClass = wrapper?.className.split(' ').find((className) => className.startsWith('css-'));
        expect(document.head.textContent).toContain(`.${selectedClass} .ag-header-select-all{visibility:hidden;}`);

        act(() => captured.props?.onSelectionChanged?.({ api: { getSelectedRows: () => [] } } as never));
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
        rerender(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryTable
                    executions={[{ processUuid: 'process-1' }]}
                    isLoading={false}
                    gridRef={gridRef}
                    onSelectionChange={onSelectionChange}
                    onDeleteProcess={vi.fn()}
                />
            </IntlProvider>
        );
        expect(wrapper?.className).toBe(initialClass);
    });

    it('hides the row delete icon on hover while any row is selected', () => {
        const gridRef = {
            current: { api: { getSelectedRows: () => [{ processUuid: 'process-1' }], applyColumnState: vi.fn() } },
        };
        const { container } = render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryTable
                    executions={[{ processUuid: 'process-1' }]}
                    isLoading={false}
                    gridRef={gridRef as never}
                    onSelectionChange={vi.fn()}
                    onDeleteProcess={vi.fn()}
                />
            </IntlProvider>
        );
        const selectedClass = container.firstElementChild?.className
            .split(' ')
            .find((className) => className.startsWith('css-'));

        expect(document.head.textContent).toContain(`.${selectedClass} .process-delete-icon{visibility:hidden;}`);
        expect(document.head.textContent).not.toContain(`.${selectedClass} .ag-row:hover .process-delete-icon`);
    });

    it('does not include rows without a process UUID in the selection', () => {
        const onSelectionChange = vi.fn();
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryTable
                    executions={[]}
                    isLoading={false}
                    gridRef={createRef<AgGridReact>()}
                    onSelectionChange={onSelectionChange}
                    onDeleteProcess={vi.fn()}
                />
            </IntlProvider>
        );

        act(() =>
            captured.props?.onSelectionChanged?.({
                api: { getSelectedRows: () => [{}, { processUuid: 'process-1' }] },
            } as never)
        );
        expect(onSelectionChange).toHaveBeenCalledWith(['process-1']);
    });
});
