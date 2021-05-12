const KEY = 'wallet3_clipboard';

interface ClipboardApi {
  writeText(content: string): string;
}

const api = window[KEY] as ClipboardApi;

export default api;
