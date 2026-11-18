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
                    // Keep the case format (e.g. xiidm) and any compression extension from the server filename.
                    const serverFilename = /filename="?([^";]+)"?/.exec(
                        response.headers.get('Content-Disposition') ?? ''
                    )?.[1];
                    console.log('DBG DBR hearder=', response.headers, response.headers.get('Content-Disposition'));
                    console.log('DBG DBR serverFilename=', serverFilename);
                    const extensionParts = serverFilename?.split('.').slice(1);
                    // keep the 2 last extensions, at most (ex: biidm.zip)
                    const extensions = extensionParts
                        ?.slice(/^(zip|gz)$/i.test(extensionParts.at(-1) ?? '') ? -2 : -1)
                        .join('.');
                    console.log('DBG DBR extension=', extensions);
                    const fileName = extensions ? `${fileNameInput}.${extensions}` : fileNameInput;
                    console.log('DBG DBR fileName=', fileName);

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
