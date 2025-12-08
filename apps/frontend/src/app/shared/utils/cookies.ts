export function setCookie(name: string, value: string, days: number): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (const cookie of ca) {
    const c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
