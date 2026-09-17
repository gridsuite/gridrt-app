/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { snapshotRefinerBaseApi } from './snapshot-refiner-base-api';

// Handwritten: no OpenAPI codegen available yet for this backend.
export type RunSnapshotRefinerApiResponse = string;
export type RunSnapshotRefinerApiArg = {
    caseFile: File;
};

const injectedRtkApi = snapshotRefinerBaseApi.injectEndpoints({
    endpoints: (build) => ({
        runSnapshotRefiner: build.mutation<RunSnapshotRefinerApiResponse, RunSnapshotRefinerApiArg>({
            query: ({ caseFile }) => {
                const formData = new FormData();
                formData.append('caseFile', caseFile);
                return {
                    url: '/v1/run',
                    method: 'POST',
                    body: formData,
                };
            },
        }),
    }),
});

export const { useRunSnapshotRefinerMutation } = injectedRtkApi;
