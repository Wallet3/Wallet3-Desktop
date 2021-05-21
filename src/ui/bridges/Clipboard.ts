const KEY = 'wallet3_clipboard';

interface ClipboardApi {
  writeText(content: string): string;
  readText(type?: 'selection' | 'clipboard'): string;
}

const api = window[KEY] as ClipboardApi;

export default api;
