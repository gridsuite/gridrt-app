/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import './src/test-utils/msw/setup-msw';

// Keep per-file mocks, stores and MSW lifecycle hooks fresh in the shared worker.
vi.hoisted(() => vi.resetModules());

const baseUriDescriptor = Object.getOwnPropertyDescriptor(document, 'baseURI');

// Testing Library's cached module only registers its automatic hooks for the first file.
beforeAll(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(cleanup);

afterAll(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    localStorage.clear();
    sessionStorage.clear();
    if (baseUriDescriptor) {
        Object.defineProperty(document, 'baseURI', baseUriDescriptor);
    } else {
        Reflect.deleteProperty(document, 'baseURI');
    }
});
