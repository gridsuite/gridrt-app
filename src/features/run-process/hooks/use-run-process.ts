/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useRunSnapshotRefinerMutation } from 'shared/api/snapshot-refiner-api';
import { isSupportedCaseFile } from '../utils/case-file.validation';

export function useRunProcess() {
    const [caseFile, setCaseFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [runSnapshotRefiner, result] = useRunSnapshotRefinerMutation();

    const selectFile = (file: File | null) => {
        setCaseFile(file);
        setFileError(file && !isSupportedCaseFile(file) ? 'runProcess.noAvailableImporter' : null);
    };

    const canRun = Boolean(caseFile) && !fileError;

    const launch = async () => {
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

    return {
        caseFile,
        fileError,
        canRun,
        launch,
        reset,
        selectFile,
        isLaunching: result.isLoading,
        isSuccess: result.isSuccess,
    };
}
