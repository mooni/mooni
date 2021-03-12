import UrlParse from 'url-parse';
import modalStyles from './modalStyles';

const defaultAppUrl = 'http://localhost:3000';

// TODO common package
const IFRAME_PROVIDER_DOMAIN = 'IFRAME_PROVIDER';
const JSON_RPC_VERSION = '2.0';

export interface MooniWidgetOptions {
  containerElement?: HTMLElement;
  appUrl?: string;
  ethereum?: ExternalProvider;
  token?: string;
  referralId?: string;
}

export interface ExternalProvider {
  isMetaMask?: boolean;
  isStatus?: boolean;
  sendAsync?: (request: {
    method: string;
    params?: Array<any>;
  }, callback: (error: any, response: any) => void) => void;
  send?: (request: {
    method: string;
    params?: Array<any>;
  }, callback: (error: any, response: any) => void) => void;
  request?: (request: {
    method: string;
    params?: Array<any>;
  }) => Promise<any>;
}

class MooniWidget {

  private isModal: boolean;
  private containerElement?: HTMLElement;
  private iframeContainerElement?: HTMLDivElement;
  private iframeElement: HTMLIFrameElement;
  private modalContainer?: HTMLDivElement;
  private confirmContainer?: HTMLDivElement;
  private appUrl: string;
  private customToken?: string;
  private referralId?: string;
  private ethereum?: ExternalProvider;
  private unlistenWeb3Messages?: () => void;

  constructor(opts: MooniWidgetOptions = {}) {

    this.appUrl = opts.appUrl || defaultAppUrl;
    this.customToken = opts.token;
    this.referralId = opts.referralId;

    this.iframeElement = document.createElement('iframe');
    this.iframeElement.className = 'mo_mooni-iframe-element';

    if(opts.containerElement) {

      this.isModal = false;
      this.containerElement = opts.containerElement;
      this.containerElement!.appendChild(this.iframeElement);
      this.iframeElement.src = this.getAppUrl();

    } else {
      this.isModal = true;

      const style = document.createElement('style');
      style.innerHTML = modalStyles;
      document.head.appendChild(style);

      this.modalContainer = document.createElement('div');
      this.modalContainer.className = 'mo_mooni-container';

      this.iframeElement.style.borderRadius = '1rem';
      this.iframeContainerElement = document.createElement('div');
      this.iframeContainerElement.id = `mooni-container-${Date.now()}`;
      this.iframeContainerElement.className = 'mo_mooni-frame';
      this.iframeContainerElement!.appendChild(this.iframeElement);

      const widgetCloser = document.createElement('div');
      widgetCloser.className = 'mo_mooni-closer';
      const cancelClose = () => {
        widgetCloser.innerHTML = 'Close️';
        widgetCloser.style.background = 'white';
        widgetCloser.onclick = defaultOnClose;
      };
      const defaultOnClose = () => {
        widgetCloser.innerHTML = 'Are you sure ?';
        widgetCloser.style.background = '#f97070';
        widgetCloser.onclick = () => {
          this.close();
          cancelClose();
        }
        setTimeout(() => {
          widgetCloser.onclick = defaultOnClose;
          cancelClose();
        }, 2000);
      };
      cancelClose();
      this.iframeContainerElement.appendChild(widgetCloser);

      this.modalContainer.appendChild(this.iframeContainerElement);
      document.body.appendChild(this.modalContainer);

    }

    this.setEthereum(opts.ethereum);
  }

  public open() {
    if(!this.isModal) {
      return;
    }
    if(!this.iframeElement.src) {
      this.iframeElement!.src = this.getAppUrl();
    }

    this.modalContainer!.style.display = 'flex';
  }

  private close() {
    if(!this.isModal) {
      return;
    }

    this.modalContainer!.style.display = 'none';
  }

  private confirmClose() {
    if(this.confirmContainer)
    this.confirmContainer.style.display = 'block';
  }


  private getAppUrl() {
    let appUrl = this.appUrl + '?';
    if(this.customToken) {
      appUrl += `&token=${this.customToken}`;
    }
    if(this.referralId) {
      appUrl += `&referralId=${this.referralId}`;
    }
    return appUrl;
  }

  private forwardWeb3Message(rawmessage: string, callback: any) {
    if(!this.ethereum) return;
    const message = JSON.parse(JSON.stringify(rawmessage));
    this.ethereum.request!({
      method: message.method,
      params: message.params,
    })
      .then(result => callback(null, result))
      .catch(error => callback(error));
  }

  private listenWeb3Messages() {

    const appOrigin = new UrlParse(this.appUrl).origin;

    const web3MessageListener = (e: any) => {
      if (e.data && e.data.jsonrpc === JSON_RPC_VERSION && e.data.domain === IFRAME_PROVIDER_DOMAIN) {
        if(e.data.method === 'mooni_handshake') {
          this.iframeElement!.contentWindow!.postMessage(
            {
              id: e.data.id,
              jsonrpc: JSON_RPC_VERSION,
              domain: IFRAME_PROVIDER_DOMAIN,
              result: 'ok',
            },
            appOrigin
          );
          return;
        }

        this.forwardWeb3Message(e.data, (error: any, result: any) => {
          const message: any = {
            id: e.data.id,
            jsonrpc: JSON_RPC_VERSION,
            domain: IFRAME_PROVIDER_DOMAIN,
            result,
          };

          if(error) {
            message.error = error;
          }
          this.iframeElement!.contentWindow!.postMessage(
            message,
            appOrigin
          );
        });

      }
    };

    window.addEventListener('message', web3MessageListener);

    this.unlistenWeb3Messages = () => {
      window.removeEventListener('message', web3MessageListener)
    };
  }

  setEthereum(ethereum?: ExternalProvider) {
    this.ethereum = ethereum;

    if(ethereum) {
      this.listenWeb3Messages();
    } else if(this.unlistenWeb3Messages) {
      this.unlistenWeb3Messages();
    }
    if(this.iframeElement.src)
      this.iframeElement.src = this.getAppUrl();
  }
}



export default MooniWidget;
