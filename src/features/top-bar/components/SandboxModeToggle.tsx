/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormControlLabel, Switch } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useIntl } from 'react-intl';

export type SandboxModeToggleProps = {
    isSandboxMode: boolean;
    onChange: (checked: boolean) => void;
};

export function SandboxModeToggle({ isSandboxMode, onChange }: Readonly<SandboxModeToggleProps>) {
    const intl = useIntl();

    const handleToggle = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        onChange(checked);
    };

    return (
        <FormControlLabel
            control={<Switch color="secondary" checked={isSandboxMode} onChange={handleToggle} />}
            label={intl.formatMessage({ id: 'topBar.sandboxMode' })}
            labelPlacement="start"
            slotProps={{ typography: { variant: 'subtitle2', sx: { color: 'secondary.main' } } }}
            sx={{ mx: 0, flexShrink: 0, whiteSpace: 'nowrap' }}
        />
    );
}
