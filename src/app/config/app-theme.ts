/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LIGHT_THEME } from '@gridsuite/commons-ui';
import { alpha, createTheme, Theme } from '@mui/material';

const componentsStyleOverrides = () => {
    return {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    };
};

// Derived from the resolved palette, hence applied in a second createTheme pass (see below)
const getTopBarTokens = ({ palette }: Theme): Pick<Theme, 'topBar'> => ({
    topBar: {
        defaultMode: { background: palette.grey[palette.mode === 'dark' ? 800 : 100] },
        sandboxMode: { background: alpha(palette.secondary.main, palette.action.selectedOpacity) },
    },
});

const lightBaseTheme = createTheme({
    palette: {
        mode: 'light',
    },
    arrow: {
        fill: '#212121',
        stroke: '#212121',
    },
    arrow_hover: {
        fill: 'white',
        stroke: 'white',
    },
    circle: {
        stroke: 'white',
        fill: 'white',
    },
    circle_hover: {
        stroke: '#212121',
        fill: '#212121',
    },
    link: {
        color: 'blue',
    },
    aggrid: {
        theme: 'ag-theme-alpine',
    },
    mapboxStyle: 'mapbox://styles/mapbox/light-v9',
    components: {
        ...componentsStyleOverrides(),
    },
});

const darkBaseTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    arrow: {
        fill: 'white',
        stroke: 'white',
    },
    arrow_hover: {
        fill: '#424242',
        stroke: '#424242',
    },
    circle: {
        stroke: '#424242',
        fill: '#424242',
    },
    circle_hover: {
        stroke: 'white',
        fill: 'white',
    },
    link: {
        color: 'green',
    },
    aggrid: {
        theme: 'ag-theme-alpine-dark',
    },
    mapboxStyle: 'mapbox://styles/mapbox/dark-v9',
    components: {
        ...componentsStyleOverrides(),
    },
});

const lightTheme: Theme = createTheme(lightBaseTheme, getTopBarTokens(lightBaseTheme));
const darkTheme: Theme = createTheme(darkBaseTheme, getTopBarTokens(darkBaseTheme));

export const getAppTheme = (theme: string): Theme => (theme === LIGHT_THEME ? lightTheme : darkTheme);
