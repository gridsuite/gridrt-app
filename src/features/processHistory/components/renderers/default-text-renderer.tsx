/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Tooltip } from '@mui/material';
import { ICellRendererParams } from 'ag-grid-community';

export function DefaultTextRenderer({ value, valueFormatted }: Readonly<ICellRendererParams>) {
    const text = (valueFormatted ?? value)?.toString() ?? '';

    return (
        <Box sx={{ whiteSpace: 'pre', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            <Tooltip title={text}>
                <span>{text}</span>
            </Tooltip>
        </Box>
    );
}
