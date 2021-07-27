import { systemPreferences } from 'electron';
const { UserConsentVerifier, UserConsentVerifierAvailability, UserConsentVerificationResult } = require('@nodert-win10-20h1/windows.security.credentials.ui')

const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

async function checkWindowsTouchIDSupported() {
  return new Promise<boolean>(resolve => {
    UserConsentVerifier.checkAvailabilityAsync((err, result) => {
      console.log('win check touchID', err, result);
      if (err) return resolve(false);
      resolve(result === UserConsentVerifierAvailability.available);
    });
  })
}

async function verifyWindowsTouchID(msg: string) {
  return new Promise<boolean>(resolve => {
    UserConsentVerifier.requestVerificationAsync(msg, (err, result) => {
      console.log('win verfiy', err, result);
      if (err) return resolve(false);
      resolve(result === UserConsentVerificationResult.verified);
    })
  })
}

export async function isTouchIDSupported() {
  if (isMac) return systemPreferences.canPromptTouchID();

  if (isWin) {
    console.log(UserConsentVerifierAvailability)
    return await checkWindowsTouchIDSupported();
  }
  
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

  if (isWin) return verifyWindowsTouchID(msg);

  return false;
}
