/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    AppSideBar as CommonAppSideBar,
    DARK_THEME,
    LIGHT_THEME,
    PARAM_DEVELOPER_MODE,
    PARAM_LANGUAGE,
    PARAM_THEME,
} from '@gridsuite/commons-ui';
import { useMemo } from 'react';
import GridrtDarkLogo from 'assets/images/gridrtDarkLogo.svg?react';
import GridrtLightLogo from 'assets/images/gridrtLightLogo.svg?react';
import { APP_NAME } from 'shared/config/application';
import { usePreference } from 'features/preferences/use-preference';
import { getSidebarTheme } from 'app/config/sidebar-theme';
import { useUserIdentity, useUserProfile } from 'features/authentication';
import { useAboutInformation } from './about/use-about-information';
import AppPackage from '../../../package.json';

type SideBarProps = {
    onLogoutClick?: () => void;
};

export function AppSideBar({ onLogoutClick }: Readonly<SideBarProps>) {
    const { value: currentTheme, update: setTheme } = usePreference(PARAM_THEME);
    const { value: selectedLanguage, update: setSelectedLanguage } = usePreference(PARAM_LANGUAGE);
    const { value: isDeveloperMode, update: handleChangeDeveloperMode } = usePreference(PARAM_DEVELOPER_MODE);
    const userIdentity = useUserIdentity();
    const userProfile = useUserProfile();
    const { appsAndUrls, globalVersionPromise, additionalModulesPromise } = useAboutInformation(userIdentity);
    const invertedThemeId = currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
    const invertedTheme = useMemo(() => getSidebarTheme(currentTheme), [currentTheme]);

    const SMALL_SCREEN_BREAKPOINT = 768;

    return (
        <CommonAppSideBar
            sideBarTheme={invertedTheme}
            isDeveloperMode={isDeveloperMode}
            smallScreenBreakpoint={SMALL_SCREEN_BREAKPOINT}
            handleChangeDeveloperMode={handleChangeDeveloperMode}
            currentTheme={currentTheme}
            setTheme={setTheme}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            appName={APP_NAME}
            appNameColor="#F06292"
            appLogo={invertedThemeId === DARK_THEME ? <GridrtDarkLogo /> : <GridrtLightLogo />}
            userProfile={userProfile ?? undefined}
            globalVersionPromise={globalVersionPromise}
            additionalModulesPromise={additionalModulesPromise}
            onLogoutClick={onLogoutClick}
            appsAndUrls={appsAndUrls}
            appVersion={AppPackage.version}
            appLicense={AppPackage.license}
        />
    );
}
