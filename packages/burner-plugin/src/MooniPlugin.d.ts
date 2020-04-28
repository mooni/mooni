import { BurnerPluginContext, Plugin } from '@burner-wallet/types';
export default class MooniPlugin implements Plugin {
    private pluginContext?;
    initializePlugin(pluginContext: BurnerPluginContext): void;
    getWeb3Provider(): import("web3-core").provider;
    forwardMessage(rawmessage: string, callback: any): void;
}
