export function setCookie(name: string, value: string, days: number): void {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const date = new Date();
  date.setTime(date.getTime() + days * MS_PER_DAY);

  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const cookiesArray = document.cookie.split(';');

  for (const cookie of cookiesArray) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(nameEQ)) {
      return trimmedCookie.substring(nameEQ.length);
    }
  }

  return null;
}
