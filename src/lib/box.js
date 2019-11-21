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
    // await BoxManager.box.syncDone;
    // console.log('box synced');

    const space = await box.openSpace('crypto-off-ramp');
    console.log('space opened');
    //await BoxManager.space.syncDone
    // console.log('space synced');

    const boxManager = new BoxManager({
      box,
      space
    });
    return boxManager;
  }

  async getPrivate(key) {
    return this.space.private.get(key)
  }
  async setPrivate(key, value) {
    return this.space.private.set(key, value)
  }
}

export default BoxManager;
