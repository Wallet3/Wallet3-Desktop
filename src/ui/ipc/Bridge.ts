const KEY = 'wallet3_ipc';

interface ContextBridgeApi {
  invoke(channel: string, ...args: any[]): Promise<any>;
  on(channel: string, listener: (event: any, ...arg: any[]) => void): void;
}

const bridge = window[KEY] as ContextBridgeApi;

export default bridge;
