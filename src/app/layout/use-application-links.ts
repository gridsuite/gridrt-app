/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { fetchAppsMetadata, Metadata } from '@gridsuite/commons-ui';
import { useUserIdentity } from 'features/authentication';

export function useApplicationLinks() {
    const userIdentity = useUserIdentity();
    const [appsAndUrls, setAppsAndUrls] = useState<Metadata[]>([]);
    useEffect(() => {
        if (userIdentity) {
            fetchAppsMetadata()
                .then(setAppsAndUrls)
                .catch((error) => console.error(error));
        }
    }, [userIdentity]);
    return appsAndUrls;
}
