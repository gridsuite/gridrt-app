/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';
import type { AgGridReactProps } from 'ag-grid-react';
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
        render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryTable executions={[{ processUuid: 'process-1' }]} isLoading={false} />
            </IntlProvider>
        );

        expect(screen.getByTestId('process-grid')).toBeInTheDocument();
        expect(captured.props?.rowSelection).toEqual({
            mode: 'multiRow',
            checkboxes: true,
            headerCheckbox: true,
            enableClickSelection: false,
        });
        expect(captured.props?.selectionColumnDef).toMatchObject({ pinned: 'left', width: 48 });
        expect(captured.props?.getRowId?.({ data: { processUuid: 'process-1' } } as never)).toBe('process-1');
    });

    it('shows every checkbox while any row is selected, and hides them again when deselected', () => {
        const { container } = render(
            <IntlProvider locale="en" messages={messages}>
                <ProcessHistoryTable executions={[{ processUuid: 'process-1' }]} isLoading={false} />
            </IntlProvider>
        );
        const wrapper = container.firstElementChild;
        const initialClass = wrapper?.className;

        expect(document.head.textContent).toContain('.ag-row:hover .ag-selection-checkbox');
        expect(document.head.textContent).toContain('.ag-header-cell:hover .ag-header-select-all');
        expect(document.head.textContent).toContain('.ag-row:hover .process-delete-icon');

        act(() => captured.props?.onSelectionChanged?.({ api: { getSelectedNodes: () => [{}] } } as never));
        expect(wrapper?.className).not.toBe(initialClass);

        act(() => captured.props?.onSelectionChanged?.({ api: { getSelectedNodes: () => [] } } as never));
        expect(wrapper?.className).toBe(initialClass);
    });
});
