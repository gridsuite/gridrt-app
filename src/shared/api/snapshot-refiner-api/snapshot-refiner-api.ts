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

export type DownloadResultCaseApiResponse = string;
export type DownloadResultCaseApiArg = {
    processUuid: string;
    caseName: string;
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
        downloadResultCase: build.mutation<DownloadResultCaseApiResponse, DownloadResultCaseApiArg>({
            query: ({ processUuid, caseName }) => ({
                url: `/v1/process/${processUuid}/result-case`,
                // the file is saved here so that only its name, and not the blob, ends up in the store
                responseHandler: async (response) => {
                    if (!response.ok) {
                        return response.text();
                    }
                    // the produced case keeps its own format (e.g. biidm): take the extension from the server filename
                    const serverFilename = /filename="?([^";]+)"?/.exec(
                        response.headers.get('Content-Disposition') ?? ''
                    )?.[1];
                    const extension = serverFilename?.split('.').pop();
                    const fileName = extension ? `${caseName.replace(/\.[^.]+$/, '')}.${extension}` : caseName;

                    const url = URL.createObjectURL(await response.blob());
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    link.click();
                    URL.revokeObjectURL(url);
                    return fileName;
                },
            }),
        }),
    }),
});

export const { useRunSnapshotRefinerMutation, useDownloadResultCaseMutation } = injectedRtkApi;
