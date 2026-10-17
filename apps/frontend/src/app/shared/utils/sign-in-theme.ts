import { ThemeEnum } from '../enums/theme.enum';

/** The cookie Keycloak's pages leave the theme chosen there in, for FastDo to take over on the way back. */
export const SIGN_IN_THEME_COOKIE: string = 'ui_theme_veds';

/**
 * The domain a cookie shared with Keycloak lives under: the parent of this host, such as `vertyll.dev` for
 * `fastdo.vertyll.dev`. `localhost` and an IP address have none, as every port there already shares cookies.
 *
 * @param hostname - this page's host name
 * @returns the shared domain, or `null` when the host has none
 */
export function sharedCookieDomain(hostname: string): string | null {
  const labels = hostname.split('.');
  const isAddress = labels.every(label => /^\d+$/.test(label));
  return labels.length > 2 && !isAddress ? labels.slice(1).join('.') : null;
}

/**
 * The theme Keycloak's pages handed over.
 *
 * @param value - the value of {@link SIGN_IN_THEME_COOKIE}, or `null` when it is absent
 * @returns the theme, or `null` when the value names none FastDo has
 */
export function signInTheme(value: string | null): ThemeEnum | null {
  return Object.values(ThemeEnum).find(theme => theme === value) ?? null;
}
