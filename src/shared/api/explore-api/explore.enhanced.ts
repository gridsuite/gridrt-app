/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { exploreGeneratedApi } from './explore.generated';

function downloadRtkQueryResult(response: Response | undefined, fileName: string): Promise<string> {
    if (window.showSaveFilePicker) {
        window
            .showSaveFilePicker({ suggestedName: fileName })
            .then((fileHandle: { createWritable: () => Promise<WritableStream<Uint8Array<ArrayBuffer>>> }) => {
                fileHandle.createWritable().then((writable: WritableStream<Uint8Array<ArrayBuffer>>) => {
                    response?.body?.pipeTo(writable);
                    writable.close();
                });
            });
    } else {
        response?.blob().then((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    return new Promise<string>((resolve) => {
        resolve('');
    });
}

export const exploreApi = exploreGeneratedApi.injectEndpoints({
    endpoints: (build) => ({
        directDownload: build.query({
            queryFn: async ({ caseUuid, fileName }, _queryApi, _extraOptions, baseQuery) => {
                await baseQuery({
                    url: `v1/explore/cases/${caseUuid}`,
                    method: 'GET',
                    headers: {
                        Accept: 'application/octet-stream',
                    },
                    responseHandler: (result) => downloadRtkQueryResult(result, fileName),
                    validateStatus: ({ status }) => status === 200,
                });
                return { data: undefined };
            },
        }),
    }),
});

export const { useLazyDirectDownloadQuery } = exploreApi;
