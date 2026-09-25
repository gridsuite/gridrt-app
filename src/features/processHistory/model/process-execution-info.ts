/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ProcessExecution } from 'shared/api/snapshot-refiner-api';

export type ProcessExecutionInfo = Omit<ProcessExecution, 'startedAt' | 'completedAt'> & {
    startedAt?: Date;
    completedAt?: Date;
};
