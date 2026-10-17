// The way into Keycloak's pages and what FastDo shares with them. Only what this file exports is meant for use elsewhere;
// the files beside it are this module's own.
import { EnvironmentProviders, Signal, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { KEYCLOAK_SIGNED_IN, KeycloakPreferences } from './keycloak-preferences.service';

export { KeycloakAccount } from './keycloak-account.service';
export { KeycloakPages } from './keycloak-pages.service';
export { KeycloakPreferences } from './keycloak-preferences.service';
export type { SecuritySettings } from './security-settings';

/**
 * Starts sharing the theme and the language with Keycloak's pages, once FastDo's own are set.
 *
 * @param signedIn - whether a reader is signed in, read in an injection context
 */
export function provideKeycloak(signedIn: () => Signal<boolean>): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: KEYCLOAK_SIGNED_IN, useFactory: signedIn },
    provideAppInitializer(() => inject(KeycloakPreferences).start()),
  ]);
}
