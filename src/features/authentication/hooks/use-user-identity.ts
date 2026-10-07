/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { shallowEqual } from 'react-redux';
import { useAppSelector } from 'app/store/hooks';
import { selectUserIdentity } from '../store/authentication.selectors';

export const useUserIdentity = () => useAppSelector(selectUserIdentity, shallowEqual);
