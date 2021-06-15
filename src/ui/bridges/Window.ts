const KEY = 'wallet3_window';

interface WindowApi {
  maximize(): void;
  minimize(): void;
}

const api = window[KEY] as WindowApi;

export default api;
