const KEY = 'wallet3_window';

interface WindowApi {
  close(): void;
}

const api = window[KEY] as WindowApi;

export default api;
