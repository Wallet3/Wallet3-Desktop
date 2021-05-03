import * as fs from 'fs';

import screenshot from 'screenshot-desktop';

export async function takeScreen() {
  try {
    const screen: Buffer = await screenshot();
    console.log(screen);
    fs.writeFileSync('/tmp/s.jpg', screen);
  } catch (error) {
    console.log(error);
  }
}
