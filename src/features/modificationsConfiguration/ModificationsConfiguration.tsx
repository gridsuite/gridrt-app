/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    BASE_MODIFICATION_TABLE_COLUMNS,
    NameCellRenderer,
    NameHeaderRenderer,
    NetworkModificationsTable,
} from '@gridsuite/commons-ui';
import { Box, Button, List, ListItemButton, ListItemText, Stack } from '@mui/material';
import { type ComponentProps, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useLazyGetConfigurationModificationsQuery,
    type ModificationTargetStep,
} from 'shared/api/snapshot-refiner-api';

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
] satisfies { id: ModificationTargetStep; title: string; subTitle: string }[];

const emptyTableProps: ComponentProps<typeof NetworkModificationsTable> = {
    modifications: [],
    columns: [
        {
            id: BASE_MODIFICATION_TABLE_COLUMNS.NAME.id,
            header: NameHeaderRenderer,
            cell: NameCellRenderer,
        },
    ],
    handleCellClick: () => undefined,
    onRowDragStart: () => undefined,
    onRowDragEnd: () => undefined,
    onSelectedRowsChange: () => undefined,
    isRowDragDisabled: true,
    highlightedModificationUuid: null,
    modificationToEditLabel: null,
    studyUuid: null,
    isImpactedByNotification: () => false,
    isFetchingModifications: false,
    pendingState: false,
};

export default function ModificationsConfiguration() {
    const [selectedTargetStep, setSelectedTargetStep] = useState<ModificationTargetStep | null>(null);
    const [loadModifications, { currentData, isFetching, isError }] = useLazyGetConfigurationModificationsQuery();

    const handleSelectConfiguration = async (targetStep: ModificationTargetStep) => {
        setSelectedTargetStep(targetStep);
        await loadModifications({ targetStep });
    };

    // TODO add useEffect to console log currentData when it changes, for debugging purposes
    useEffect(() => {
        console.log('currentData:', currentData);
    }, [currentData]);

    return (
        <Stack direction="row" sx={{ height: '100%', width: '100%' }}>
            <List disablePadding sx={{ width: '50%', borderRight: 1, borderColor: 'divider' }}>
                {modificationConfigurations.map(({ id, title, subTitle }) => (
                    <ListItemButton
                        key={id}
                        selected={selectedTargetStep === id}
                        onClick={() => handleSelectConfiguration(id)}
                        sx={{ px: 3, py: 2 }}
                    >
                        <ListItemText
                            primary={<FormattedMessage id={title} />}
                            secondary={<FormattedMessage id={subTitle} />}
                            slotProps={{
                                primary: { color: 'text.primary', variant: 'body1' },
                                secondary: { color: 'text.secondary', variant: 'body2' },
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>
            <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0, px: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: 2 }}>
                    <Button variant="contained">
                        <FormattedMessage id="ModificationConfigAddModification" />
                    </Button>
                </Box>
                <NetworkModificationsTable
                    {...emptyTableProps}
                    modifications={
                        isError ? emptyTableProps.modifications : (currentData ?? emptyTableProps.modifications)
                    }
                    isFetchingModifications={isFetching}
                />
            </Stack>
        </Stack>
    );
}
