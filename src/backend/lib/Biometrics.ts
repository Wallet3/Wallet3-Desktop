import * as os from 'os';

import { systemPreferences } from 'electron';

const isWin = process.platform === 'win32';
const isWin10OrLater = isWin && Number.parseFloat(os.release()) >= 10;

const EmptyWindowsSecurity = {
  UserConsentVerifier: undefined,
  UserConsentVerificationResult: undefined,
  UserConsentVerifierAvailability: undefined,
};

const { UserConsentVerifier, UserConsentVerifierAvailability, UserConsentVerificationResult } = isWin
  ? isWin10OrLater
    ? require('@nodert-win10-20h1/windows.security.credentials.ui')
    : EmptyWindowsSecurity
  : EmptyWindowsSecurity;

async function checkWindowsTouchIDSupported() {
  return new Promise<boolean>((resolve) => {
    try {
      UserConsentVerifier.checkAvailabilityAsync((err, result) => {
        if (err) return resolve(false);
        resolve(result === UserConsentVerifierAvailability.available);
      });
    } catch (error) {
      resolve(false);
    }
  });
}

async function verifyWindowsTouchID(msg: string) {
  return new Promise<boolean>((resolve) => {
    try {
      UserConsentVerifier.requestVerificationAsync(msg, (err, result) => {
        if (err) return resolve(false);
        resolve(result === UserConsentVerificationResult.verified);
      });
    } catch (error) {
      resolve(false);
    }
  });
}

export async function isTouchIDSupported() {
  switch (process.platform) {
    case 'darwin':
      return systemPreferences.canPromptTouchID();

    case 'win32':
      return await checkWindowsTouchIDSupported();
  }

  return false;
}

export async function verifyTouchID(msg: string) {
  switch (process.platform) {
    case 'darwin':
      try {
        await systemPreferences.promptTouchID(msg);
        return true;
      } catch (error) {
        return false;
      }

    case 'win32':
      return verifyWindowsTouchID(msg);
  }

  return false;
}
