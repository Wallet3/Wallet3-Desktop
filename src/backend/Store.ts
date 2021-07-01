import electron, { app } from 'electron';

import fs from 'fs';
import path from 'path';

type AppData = {
  walletId?: number;
};

function parseDataFile<T>(filePath: string, defaults: T) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

class Store {
  private path: string;
  data: AppData;

  constructor() {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = app.getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, 'app.json');

    this.data = parseDataFile<AppData>(this.path, { walletId: 1 });
  }

  // This will just return the property on the `data` object
  get(key: string) {
    return this.data[key];
  }

  // ...and this will set it
  set(key: string, val: any) {
    this.data[key] = val;
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

export default new Store();
