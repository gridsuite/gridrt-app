/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Alert, InputAdornment, Stack, TextField } from '@mui/material';
import { DriveFolderUpload as DriveFolderUploadIcon } from '@mui/icons-material';
import { useRef, type ChangeEvent } from 'react';
import { useIntl } from 'react-intl';

export type CaseFileFieldProps = {
    file: File | null;
    error: string | null;
    disabled?: boolean;
    onChange: (file: File | null) => void;
};

export function CaseFileField({ file, error, disabled, onChange }: Readonly<CaseFileFieldProps>) {
    const intl = useIntl();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        onChange(input.files?.[0] ?? null);
        // Allow re-selecting the exact same file (input change event would not fire otherwise).
        input.value = '';
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const importLabel = intl.formatMessage({ id: 'runProcess.importCaseFile' });

    return (
        <Stack spacing={1} sx={{ width: '100%', minWidth: 200, flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* placeholder (not label) when empty: an adorned label is always shrunk by MUI, which clips it */}
            <TextField
                fullWidth
                variant="outlined"
                size="small"
                label={file ? importLabel : undefined}
                placeholder={file ? undefined : importLabel}
                value={file?.name ?? ''}
                error={Boolean(error)}
                disabled={disabled}
                onClick={handleClick}
                slotProps={{
                    input: {
                        readOnly: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <DriveFolderUploadIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        sx: { cursor: disabled ? 'default' : 'pointer' },
                    },
                }}
            />
            <input ref={fileInputRef} type="file" hidden onChange={handleChange} data-testid="case-file-input" />
            {error && (
                <Alert severity="error" data-testid="case-file-error" sx={{ width: '100%' }}>
                    {intl.formatMessage({ id: error })}
                </Alert>
            )}
        </Stack>
    );
}
