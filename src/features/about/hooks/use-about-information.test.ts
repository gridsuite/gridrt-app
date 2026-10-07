/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { createTestContext } from 'test-utils/create-test-context';
import { server } from 'test-utils/msw/server';
import { useAboutInformation } from './use-about-information';

it('loads About information through the current Redux context and deployment metadata', async () => {
    let authorization: string | null = null;
    server.use(
        http.get('*/study/v1/servers/about', ({ request }) => {
            authorization = request.headers.get('authorization');
            return HttpResponse.json([{ name: 'Snapshot refiner', type: 'server', version: '1.0', gitTag: 'v1' }]);
        }),
        http.get('*/env.json', () => HttpResponse.json({ appsMetadataServerUrl: 'https://metadata.test' })),
        http.get('https://metadata.test/version.json', () => HttpResponse.json({ deployVersion: 'deployment-1' }))
    );
    const { wrapper } = createTestContext();
    const { result } = renderHook(() => useAboutInformation(), { wrapper });
    const [modules, version] = await Promise.all([
        result.current.additionalModulesPromise(),
        result.current.globalVersionPromise(),
    ]);
    expect(modules).toEqual([{ name: 'Snapshot refiner', type: 'server', version: '1.0', gitTag: 'v1' }]);
    expect(version).toBe('deployment-1');
    expect(authorization).toBe('Bearer test-token');
});
