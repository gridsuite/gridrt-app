/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, List, ListItem, ListItemText, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';

const modificationConfigurations = [
    {
        id: 'ESTIM_MODIFICATIONS',
        title: 'ModificationConfigBeforeEstim',
        subTitle: 'ModificationConfigApplyAlways',
    },
    {
        id: 'LOADFLOW_MODIFICATIONS',
        title: 'ModificationConfigAfterEstim',
        subTitle: 'ModificationConfigApplyAlways',
    },
    {
        id: 'ESTIM_FALLBACK_MODIFICATIONS',
        title: 'ModificationConfigAfterEstimFailure',
        subTitle: 'ModificationConfigApplyOnEstimDiv',
    },
    {
        id: 'LOADFLOW_FALLBACK_ESTIM_MODIFICATIONS',
        title: 'ModificationConfigBeforeEstim',
        subTitle: 'ModificationConfigApplyOnLoadflowDiv',
    },
    {
        id: 'LOADFLOW_FALLBACK_LOADFLOW_MODIFICATIONS',
        title: 'ModificationConfigAfterEstim',
        subTitle: 'ModificationConfigApplyOnLoadflowDiv',
    },
];

export default function ModificationsConfiguration() {
    return (
        <Stack direction="row" sx={{ height: '100%', width: '100%' }}>
            <List disablePadding sx={{ width: '50%', borderRight: 1, borderColor: 'divider' }}>
                {modificationConfigurations.map(({ id, title, subTitle }) => (
                    <ListItem key={id} sx={{ px: 3, py: 2 }}>
                        <ListItemText
                            primary={<FormattedMessage id={title} />}
                            secondary={<FormattedMessage id={subTitle} />}
                            slotProps={{
                                primary: { color: 'text.primary', variant: 'body1' },
                                secondary: { color: 'text.secondary', variant: 'body2' },
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flex: 1 }} />
        </Stack>
    );
}
