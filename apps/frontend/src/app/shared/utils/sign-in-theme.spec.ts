import { describe, expect, it } from 'vitest';
import { ThemeEnum } from '../enums/theme.enum';
import { sharedCookieDomain, signInTheme } from './sign-in-theme';

describe('sharedCookieDomain', () => {
  it('is the parent domain of a subdomain', () => {
    expect(sharedCookieDomain('fastdo.vertyll.dev')).toBe('vertyll.dev');
  });

  it('is none on localhost, where every port shares cookies', () => {
    expect(sharedCookieDomain('localhost')).toBeNull();
  });

  it('is none on an IP address', () => {
    expect(sharedCookieDomain('127.0.0.1')).toBeNull();
  });
});

describe('signInTheme', () => {
  it('reads a theme FastDo has', () => {
    expect(signInTheme('dark')).toBe(ThemeEnum.Dark);
  });

  it('ignores a theme FastDo does not have', () => {
    expect(signInTheme('system')).toBeNull();
  });

  it('is none without the cookie', () => {
    expect(signInTheme(null)).toBeNull();
  });
});
