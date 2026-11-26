/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { snapshotRefinerBaseApi } from './snapshot-refiner-base-api';

export type RunSnapshotRefinerApiResponse = string;
export type RunSnapshotRefinerApiArg = {
    caseFile: File;
};

export type DownloadResultCaseApiArg = {
    processUuid: string;
    fileNameInput: string;
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
        downloadResultCase: build.mutation<string, DownloadResultCaseApiArg>({
            query: ({ processUuid, fileNameInput }) => ({
                url: `/v1/process/${processUuid}/result-case`,
                // the file is saved here so that only its name, and not the blob, ends up in the store
                responseHandler: async (response) => {
                    if (!response.ok) {
                        return response.text();
                    }
                    // Use user input, and concat with the case format (e.g. xiidm) and compression (e.g. gz) extensions from the server filename.
                    // Ex: user input = "myCase", serverFilename = "case.xiidm.gz" => myCase.xiidm.gz
                    const serverFilename = /filename="?([^";]+)"?/.exec(
                        response.headers.get('Content-Disposition') ?? ''
                    )?.[1];
                    const extensionParts = serverFilename?.split('.').slice(1);
                    // keep the 2 last extensions, at most (ex: xiidm.gz)
                    const extensions = extensionParts
                        ?.slice(/^(zip|gz)$/i.test(extensionParts.at(-1) ?? '') ? -2 : -1)
                        .join('.');
                    const fileName = extensions ? `${fileNameInput}.${extensions}` : fileNameInput;

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
