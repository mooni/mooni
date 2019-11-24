import Box from '3box';

class BoxManager {
  constructor(obj) {
    Object.assign(this, obj);
  }

  static async init(connect) {
    const provider = connect.ethereum;
    const address = connect.accounts[0];

    const box = await Box.openBox(address, provider);
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
    const data = await this.space.private.get(key);
    if(!data) return null;
    return JSON.parse(data);
  }
  async setPrivate(key, value) {
    const serialized = JSON.stringify(value);
    return this.space.private.set(key, serialized);
  }
}

export default BoxManager;
