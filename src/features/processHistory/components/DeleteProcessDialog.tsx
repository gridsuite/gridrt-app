/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

type DeleteProcessDialogProps = {
    open: boolean;
    count: number;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
};

export function DeleteProcessDialog({
    open,
    count,
    onClose,
    onConfirm,
    isDeleting,
}: Readonly<DeleteProcessDialogProps>) {
    return (
        <Dialog open={open} onClose={isDeleting ? undefined : onClose} aria-labelledby="delete-process-title">
            <DialogTitle id="delete-process-title">
                <FormattedMessage id="processHistory.deleteDialogTitle" values={{ count }} />
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: 'text.primary' }}>
                    <FormattedMessage id="processHistory.deleteDialogContent" values={{ count }} />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isDeleting}>
                    <FormattedMessage id="processHistory.cancelSelection" />
                </Button>
                <Button variant="contained" color="error" disabled={isDeleting} onClick={onConfirm}>
                    <FormattedMessage id="processHistory.deleteSelected" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
