import MooniPage from './ui/MooniPage';
export default class MooniPlugin {
    initializePlugin(pluginContext) {
        this.pluginContext = pluginContext;
        pluginContext.addPage('/cash-out', MooniPage);
        pluginContext.addButton('apps', 'My Plugin', '/my-page', {
            description: 'Sample plugin page',
        });
    }
    getWeb3Provider() {
        const web3 = this.pluginContext.getWeb3('1');
        return web3.currentProvider;
    }
    forwardMessage(rawmessage, callback) {
    }
}
//# sourceMappingURL=MooniPlugin.js.map