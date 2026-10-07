/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SUPPORTED_CASE_FILE_EXTENSIONS } from '../constants/case-file.constants';

export function isSupportedCaseFile(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return Boolean(extension) && SUPPORTED_CASE_FILE_EXTENSIONS.includes(extension as string);
}
