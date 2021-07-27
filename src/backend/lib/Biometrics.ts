import { systemPreferences } from 'electron';

const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

export function isTouchIDSupported() {
  if (isMac) return systemPreferences.canPromptTouchID();

  return false;
}

export async function verifyTouchID(msg: string) {
  if (isMac) {
    try {
      await systemPreferences.promptTouchID(msg);
      return true;
    } catch (error) {
      return false;
    }
  }

  return false;
}
