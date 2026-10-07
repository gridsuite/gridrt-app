/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { fetchAppsMetadata, Metadata } from '@gridsuite/commons-ui';
import type { UserIdentity } from 'features/authentication';
import { useAppDispatch } from 'app/store/hooks';
import { fetchBackendModules } from './fetch-backend-modules';
import { fetchDeploymentVersion } from './fetch-deployment-version';

export function useAboutInformation(userIdentity: UserIdentity | null) {
    const dispatch = useAppDispatch();
    const [appsAndUrls, setAppsAndUrls] = useState<Metadata[]>([]);

    useEffect(() => {
        if (userIdentity) {
            fetchAppsMetadata()
                .then(setAppsAndUrls)
                .catch((error) => console.error(error));
        }
    }, [userIdentity]);

    return {
        appsAndUrls,
        globalVersionPromise: () => fetchDeploymentVersion().then((res) => res.deployVersion ?? 'unknown'),
        additionalModulesPromise: () => fetchBackendModules(dispatch),
    };
}
