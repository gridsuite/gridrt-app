/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useRunSnapshotRefinerMutation } from 'shared/api/snapshot-refiner-api';
import { isNetworkFile } from '../utils/network-file';

export function useRunProcess() {
    const [caseFile, setCaseFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [runSnapshotRefiner, result] = useRunSnapshotRefinerMutation();

    const selectFile = (file: File | null) => {
        setCaseFile(file);
        setFileError(file && !isNetworkFile(file) ? 'runProcess.noAvailableImporter' : null);
    };

    const canRun = Boolean(caseFile) && !fileError;

    const run = async () => {
        if (!caseFile || fileError) {
            return;
        }
        // errors surface via the global RTK Query error middleware (snackbar)
        await runSnapshotRefiner({ caseFile });
    };

    const reset = () => {
        setCaseFile(null);
        setFileError(null);
        result.reset();
    };

    return { caseFile, fileError, canRun, run, reset, result, selectFile };
}
