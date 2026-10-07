/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NotificationsUrlKeys, PREFIX_CONFIG_NOTIFICATION_WS } from '@gridsuite/commons-ui';
import { renderHook } from '@testing-library/react';
import { APP_NAME } from 'shared/config/application';
import { beforeEach, describe, expect, it } from 'vitest';
import { useNotificationUrls } from './use-notification-urls';

describe('useNotificationUrls', () => {
    beforeEach(() => {
        Object.defineProperty(document, 'baseURI', {
            configurable: true,
            value: 'https://gridapp.test/',
        });
    });

    it('builds a secure websocket URL from an https base URI', () => {
        const { result } = renderHook(() => useNotificationUrls());
        const params = new URLSearchParams({ appName: APP_NAME });

        expect(result.current).toEqual({
            [NotificationsUrlKeys.CONFIG]: `wss://gridapp.test/${PREFIX_CONFIG_NOTIFICATION_WS}/notify?${params}`,
        });
    });

    it('builds a non-secure websocket URL from an http base URI', () => {
        Object.defineProperty(document, 'baseURI', {
            configurable: true,
            value: 'http://gridapp.test/',
        });
        const { result } = renderHook(() => useNotificationUrls());
        const params = new URLSearchParams({ appName: APP_NAME });

        expect(result.current).toEqual({
            [NotificationsUrlKeys.CONFIG]: `ws://gridapp.test/${PREFIX_CONFIG_NOTIFICATION_WS}/notify?${params}`,
        });
    });
});
