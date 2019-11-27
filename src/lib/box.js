import Box from '3box';

class BoxManager {
  constructor(obj) {
    Object.assign(this, obj);
  }

  static async init(ethManager) {
    const box = await Box.openBox(ethManager.getAddress(), ethManager.ethereum);
    console.log('box opened');
    await box.syncDone;
    console.log('box synced');

    const space = await box.openSpace('crypto-off-ramp');
    console.log('space opened');
    await space.syncDone;
    console.log('space synced');

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
