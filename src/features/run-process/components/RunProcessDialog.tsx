/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Close as CloseIcon } from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { CaseFileField } from './CaseFileField';
import { useRunProcess } from '../hooks/use-run-process';

export type RunProcessDialogProps = {
    open: boolean;
    onClose: () => void;
};

const FORM_POPUP_WIDTH_SX = {
    '& .MuiDialog-paper': {
        width: '95%',
        '@media (min-width:768px)': {
            width: '50%',
        },
    },
};

const ACTION_BUTTON_SX = { typography: 'subtitle2', textTransform: 'none' } as const;

function DialogCloseIconButton({ onClick }: Readonly<{ onClick: () => void }>) {
    const intl = useIntl();

    return (
        <IconButton onClick={onClick} size="small" aria-label={intl.formatMessage({ id: 'close' })}>
            <CloseIcon fontSize="small" sx={{ color: 'text.primary' }} />
        </IconButton>
    );
}

export function RunProcessDialog({ open, onClose }: Readonly<RunProcessDialogProps>) {
    const intl = useIntl();
    const { caseFile, fileError, canRun, run, reset, result, selectFile } = useRunProcess();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={result.isSuccess ? 'xs' : false}
            fullWidth={result.isSuccess}
            sx={result.isSuccess ? undefined : FORM_POPUP_WIDTH_SX}
            slotProps={{ transition: { onExited: reset } }}
        >
            {result.isSuccess ? (
                <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', py: 1 }}>
                        <DialogCloseIconButton onClick={onClose} />
                    </DialogTitle>
                    <DialogContent sx={{ pt: 0 }}>
                        <Stack spacing={2} alignItems="center" sx={{ pb: 3 }}>
                            <CheckCircleIcon color="secondary" sx={{ fontSize: 48 }} />
                            <Typography variant="h6" color="text.primary">
                                {intl.formatMessage({ id: 'runProcess.successTitle' })}
                            </Typography>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} variant="contained" color="secondary" sx={ACTION_BUTTON_SX}>
                            {intl.formatMessage({ id: 'close' })}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <>
                    <DialogTitle
                        variant="h5"
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        {intl.formatMessage({ id: 'runProcess.dialogTitle' })}
                        <DialogCloseIconButton onClick={onClose} />
                    </DialogTitle>
                    {/* overflow: visible avoids clipping the field's floating label; the doubled selector
                        overrides MUI's own `.MuiDialogTitle-root + &` padding-top: 0 rule. */}
                    <DialogContent sx={{ overflow: 'visible', '&.MuiDialogContent-root': { pt: '20px' } }}>
                        <CaseFileField
                            file={caseFile}
                            error={fileError}
                            disabled={result.isLoading}
                            onChange={selectFile}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} disabled={result.isLoading} color="secondary" sx={ACTION_BUTTON_SX}>
                            {intl.formatMessage({ id: 'runProcess.cancel' })}
                        </Button>
                        <Button
                            onClick={run}
                            variant="contained"
                            color="secondary"
                            disabled={!canRun || result.isLoading}
                            sx={ACTION_BUTTON_SX}
                        >
                            {intl.formatMessage({
                                id: result.isLoading ? 'runProcess.launching' : 'runProcess.launch',
                            })}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}
