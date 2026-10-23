/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomMuiDialog,
    emptyExportNetworkFormData,
    EXPORT_PARAMETERS,
    ExportNetworkForm,
    ExportNetworkFormData,
    exportNetworkFormSchema,
    exportNetworkFormToDto,
    FILE_NAME,
    isDisabledValidationButton,
    NetworkExportInfos,
    PARAM_DEVELOPER_MODE,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useAppParameterState } from 'features/app-parameters/hooks/use-app-parameter-state';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import type { ProcessToDownload } from '../pages/ProcessHistoryPage';

type DownloadCaseDialogProps = {
    open: boolean;
    isDownloading: boolean;
    processToDownload: ProcessToDownload | null;
    onClose: () => void;
    onDownload: (params: Record<string, any>, exportInfos: NetworkExportInfos) => void;
};

export function DownloadCaseDialog({
    open,
    isDownloading,
    processToDownload,
    onClose,
    onDownload,
}: DownloadCaseDialogProps) {
    const [isDeveloperMode] = useAppParameterState(PARAM_DEVELOPER_MODE);

    const methods = useForm<ExportNetworkFormData>({
        defaultValues: emptyExportNetworkFormData,
        resolver: yupResolver(exportNetworkFormSchema),
    });

    const {
        formState: { errors },
        reset,
    } = methods;

    useEffect(() => {
        // Set form values to default to enable download case witout specifying format and compression in form
        // It will use case format and extension from server
        reset((formValues) => ({
            ...formValues,
            fileName: processToDownload?.caseName ?? '',
            exportFormat: 'unused',
            exportCompression: 'unused',
        }));
    }, [processToDownload, reset]);

    const onSubmit = useCallback(
        (data: ExportNetworkFormData) => {
            const dto = exportNetworkFormToDto(data);
            onDownload(data[EXPORT_PARAMETERS], dto);
        },
        [onDownload]
    );
    return (
        <CustomMuiDialog
            onClose={onClose}
            open={open}
            formContext={{
                ...methods,
                validationSchema: exportNetworkFormSchema,
            }}
            disabledSave={isDisabledValidationButton(errors, FILE_NAME) || isDownloading}
            onSave={onSubmit}
            titleId="DownloadCase"
            sx={{
                '.MuiDialog-paper': {
                    minWidth: '30vw',
                },
            }}
        >
            <ExportNetworkForm open={open} isDeveloperMode={isDeveloperMode} displayFormat={false} />
        </CustomMuiDialog>
    );
}
