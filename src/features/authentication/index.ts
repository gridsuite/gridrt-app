/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export { AuthenticationGate } from './components/AuthenticationGate';
export { useAuthentication } from './hooks/use-authentication';
export { useIsAuthenticated } from './hooks/use-is-authenticated';
export { useUserIdentity } from './hooks/use-user-identity';
export type { UserIdentity } from './store/authentication.type';
export { useUserProfile } from './hooks/use-user-profile';
