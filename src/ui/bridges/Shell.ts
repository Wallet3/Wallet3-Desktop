const KEY = 'wallet3_shell';

interface ShellApi {
  open(url: string): string;
}

const api = window[KEY] as ShellApi;

export default api;
