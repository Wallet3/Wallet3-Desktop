import App from './App';
import { app } from 'electron';
import axios from 'axios';
import { createWriteStream } from 'fs';
import got from 'got';
import i18n from '../i18n';
import path from 'path';
import { spawn } from 'child_process';
import { tmpdir } from 'os';

export async function checkUpdates() {
  const resp = await axios.get('https://raw.githubusercontent.com/Wallet3/Wallet3/master/package.json');
  const { version: stableVersion } = resp.data as { version: string };
  const currentVersion = app.getVersion();
  return { updateAvailable: stableVersion > currentVersion, stableVersion, currentVersion };
}

async function installWindows(options: {
  installerPath: string;
  isSilent: boolean;
  isForceRunAfter: boolean;
  isAdminRightsRequired: boolean;
}): Promise<boolean> {
  const args = ['--updated'];
  if (options.isSilent) {
    args.push('/S');
  }

  if (options.isForceRunAfter) {
    args.push('--force-run');
  }

  const packagePath = null;
  if (packagePath != null) {
    // only = form is supported
    args.push(`--package-file=${packagePath}`);
  }

  const callUsingElevation = async (): Promise<void> => {
    await _spawn(path.join(process.resourcesPath!, 'elevate.exe'), [options.installerPath].concat(args)).catch((e) => {});
  };

  if (options.isAdminRightsRequired) {
    console.log('isAdminRightsRequired is set to true, run installer using elevate.exe');
    await callUsingElevation();
    return true;
  }

  await _spawn(options.installerPath, args).catch((e: Error) => {
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    const errorCode = (e as NodeJS.ErrnoException).code;
    console.log(
      `Cannot run installer: error code: ${errorCode}, error message: "${e.message}", will be executed again using elevate if EACCES"`
    );
    if (errorCode === 'UNKNOWN' || errorCode === 'EACCES') {
      callUsingElevation();
    } else {
    }
  });

  process.exit(0);
}

async function _spawn(exe: string, args: Array<string>): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const process = spawn(exe, args, {
        detached: true,
        stdio: 'ignore',
        shell: true,
      });

      process.once('error', (error) => {
        console.error(`error: ${error}`);
        reject(error);
      });

      process.unref();

      if (process.pid !== undefined) {
        resolve(true);
      }
    } catch (error) {
      reject(error);
    }
  });
}

async function installDMG(dmgPath: string) {
  const magic = `sleep 2s && rm -rf '/Applications/Wallet 3.app'; VOLUME=$(hdiutil attach -nobrowse ${dmgPath} | awk 'END {print $3" "$4" "$5}') && (rsync -a "$VOLUME"/*.app /Applications/; SYNCED=$? hdiutil detach -quiet "$VOLUME"; exit $? || exit "$SYNCED") && open '/Applications/Wallet 3.app'`;
  await _spawn(magic, []);
  process.exit(0);
}

async function installUpdate(version: string, execPath: string) {
  const approved = await App.ask({
    title: i18n.t('New Update Available'),
    icon: 'arrow-up-circle',
    message: i18n.t('Update Message', { version }),
  });

  if (!approved) return;

  switch (process.platform) {
    case 'win32':
      installWindows({ installerPath: execPath, isAdminRightsRequired: false, isForceRunAfter: true, isSilent: false });
      break;
    case 'darwin':
      installDMG(execPath);
      break;
  }
}

export async function updateApp() {
  const { updateAvailable, stableVersion } = await checkUpdates();
  if (!updateAvailable) return;

  const platform = process.platform;
  const os = platform === 'win32' ? 'win' : platform === 'darwin' ? 'mac' : 'linux';
  const ext = platform === 'win32' ? 'exe' : platform === 'darwin' ? 'dmg' : 'AppImage';
  const artifactName = `wallet3-${os}-${process.arch}-${stableVersion}.${ext}`;

  const pkgUrl = `https://github.com/Wallet3/Wallet3/releases/download/v${stableVersion}/${artifactName}`;
  const dlPath = path.join(tmpdir(), `wallet3-${Date.now()}.${ext}`);

  let dlStream = got.stream(pkgUrl);
  let tmpfileStream = createWriteStream(dlPath);

  dlStream.on('downloadProgress', ({ transferred, total, percent }) => {
    const percentage = Math.round(percent * 100);
    console.error(`progress: ${transferred}/${total} (${percentage}%)`);
  });

  dlStream.once('error', () => dlStream.removeAllListeners());

  tmpfileStream.once('error', () => dlStream.removeAllListeners());

  tmpfileStream.once('finish', () => {
    dlStream.removeAllListeners();
    dlStream = null;

    installUpdate(stableVersion, dlPath);
  });

  dlStream.pipe(tmpfileStream);
}
