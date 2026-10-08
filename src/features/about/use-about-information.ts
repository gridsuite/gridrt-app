/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useAppDispatch } from 'app/store/hooks';
import AppPackage from '../../../package.json';
import { fetchBackendModules } from './fetch-backend-modules';
import { fetchDeploymentVersion } from './fetch-deployment-version';

export function useAboutInformation() {
    const dispatch = useAppDispatch();
    return {
        appVersion: AppPackage.version,
        appLicense: AppPackage.license,
        globalVersionPromise: () => fetchDeploymentVersion().then((res) => res.deployVersion ?? 'unknown'),
        additionalModulesPromise: () => fetchBackendModules(dispatch),
    };
}
