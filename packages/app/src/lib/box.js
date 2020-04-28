import Box from '3box';

import { log } from './log';

class BoxManager {
  constructor({ box, space }) {
    this.box = box;
    this.space = space;
  }

  static hasAlreadyOpened(address) {
    return Box.isLoggedIn(address);
  }

  static async init(ethManager) {
    const box = await Box.openBox(ethManager.getAddress(), ethManager.ethereum);
    log('box opened');
    await box.syncDone;
    log('box synced');

    const space = await box.openSpace('mooni');
    log('space opened');
    await space.syncDone;
    log('space synced');

    return new BoxManager({
      box,
      space
    });
  }

  async getPrivate(key) {
    return this.space.private.get(key);
  }
  async setPrivate(key, value) {
    return this.space.private.set(key, value);
  }
}

export default BoxManager;
