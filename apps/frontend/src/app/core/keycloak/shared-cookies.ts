import { ThemeEnum } from '../../shared/enums/theme.enum';
import { getCookie } from '../../shared/utils/cookies';

/**
 * A choice the reader shares with Keycloak's pages, kept in a cookie both read and write: a shared record rather than a
 * message, so the two agree however the reader moves between them, through a sign-in, a cancelled account action, the
 * browser's history or another tab.
 */
export const SHARED_THEME_COOKIE = 'ui_theme_veds';
export const SHARED_LANGUAGE_COOKIE = 'ui_locale_veds';

const ONE_YEAR = 60 * 60 * 24 * 365;

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
 * The theme in the shared cookie.
 *
 * @param value - the value of {@link SHARED_THEME_COOKIE}, or `null` when it is absent
 * @returns the theme, or `null` when the value names none FastDo has
 */
export function sharedTheme(value: string | null): ThemeEnum | null {
  return Object.values(ThemeEnum).find(theme => theme === value) ?? null;
}

/** Reads a cookie shared with Keycloak's pages. */
export function readShared(name: string): string | null {
  return getCookie(name);
}

/** Writes a cookie shared with Keycloak's pages, under the domain both live under, for a year. */
export function writeShared(document: Document, name: string, value: string): void {
  const domain = sharedCookieDomain(document.location.hostname);
  const secure = document.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${
    domain === null ? '' : `; Domain=${domain}`
  }${secure}`;
}
