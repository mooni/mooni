import { BurnerPluginContext, Plugin } from '@burner-wallet/types';
import MooniPage from './ui/MooniPage';
import MooniElement from './ui/MooniElement';

export default class MooniPlugin implements Plugin {
  private pluginContext?: BurnerPluginContext;

  initializePlugin(pluginContext: BurnerPluginContext) {
    this.pluginContext = pluginContext;

    pluginContext.addPage('/mooni', MooniPage);
    pluginContext.addButton('apps', 'Cash out', '/mooni', {
      description: 'Transfer funds to your bank account',
    });

    pluginContext.addElement('home-middle', MooniElement);
  }

  getWeb3Provider() {
    const web3 = this.pluginContext!.getWeb3('1');
    return web3.currentProvider;
  }
}
