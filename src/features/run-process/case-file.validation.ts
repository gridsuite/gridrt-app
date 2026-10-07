/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// No "check importer" endpoint exists yet, so this is a client-side extension whitelist.
export const SUPPORTED_CASE_FILE_EXTENSIONS = [
    'xiidm',
    'iidm',
    'biidm',
    'jiidm',
    'xml',
    'uct',
    'ucte',
    'arc',
    'cgmes',
    'zip',
];

export function isSupportedCaseFile(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return Boolean(extension) && SUPPORTED_CASE_FILE_EXTENSIONS.includes(extension as string);
}
