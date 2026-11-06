/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum NotificationType {
    EXECUTION_CREATED = 'EXECUTION_CREATED',
    EXECUTION_UPDATED = 'EXECUTION_UPDATED',
    EXECUTION_DELETED = 'EXECUTION_DELETED',
}

// EventData

export type SnapshotRefinerExecutionEventData = {
    headers: {
        updateType: NotificationType;
        executionId: string;
    };
};

// Predicates

export function isProcessExecutionUpdateNotification(notif: any): notif is SnapshotRefinerExecutionEventData {
    return Object.values(NotificationType).includes(notif?.headers?.updateType);
}
