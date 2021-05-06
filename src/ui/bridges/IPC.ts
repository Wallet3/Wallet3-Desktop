const KEY = 'wallet3_ipc';

interface ContextBridgeApi {
  invoke<T>(channel: string, args?: any): Promise<T>;
  invokeSecure<T>(channel: string, objArg?: any): Promise<T>;
  on(channel: string, listener: (event: any, ...arg: any[]) => void): void;
  once(channel: string, listener: (event: any, ...arg: any[]) => void): void;
}

const bridge = window[KEY] as ContextBridgeApi;

export default bridge;
