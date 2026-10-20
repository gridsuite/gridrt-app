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
};

export function DeleteProcessDialog({ open, count, onClose }: Readonly<DeleteProcessDialogProps>) {
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="delete-process-title">
            <DialogTitle id="delete-process-title">
                {count > 1 ? (
                    <FormattedMessage id="processHistory.deleteMultipleDialogTitle" values={{ count }} />
                ) : (
                    <FormattedMessage id="processHistory.deleteDialogTitle" />
                )}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <FormattedMessage
                        id={
                            count > 1
                                ? 'processHistory.deleteMultipleDialogContent'
                                : 'processHistory.deleteDialogContent'
                        }
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    <FormattedMessage id="processHistory.cancelSelection" />
                </Button>
                <Button variant="contained" color="error" disabled>
                    <FormattedMessage id="processHistory.deleteSelected" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
