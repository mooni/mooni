import UrlParse from 'url-parse';
import modalStyles from './modalStyles';

const defaultAppUrl = 'http://localhost:3000';

interface MooniWidgetOptions {
  containerElement?: HTMLElement;
  appUrl?: string;
  web3Provider?: any;
  token?: string;
}

class MooniWidget {

  private isModal: boolean;
  private containerElement?: HTMLElement;
  private iframeContainerElement?: HTMLDivElement;
  private iframeElement?: HTMLIFrameElement;
  private modalContainer?: HTMLDivElement;
  private appUrl: string;
  private customToken?: string;
  private web3Provider?: any;

  constructor(opts: MooniWidgetOptions = {}) {

    if(opts.containerElement) {
      this.containerElement = opts.containerElement;
      this.isModal = false;
    } else {
      this.isModal = true;
      this.createModal();
    }

    this.appUrl = opts.appUrl || defaultAppUrl;
    this.customToken = opts.token;

    this.createIframe();

    if(opts.web3Provider) {
      this.web3Provider = opts.web3Provider;
      this.listenWeb3Messages();
    }

  }

  private createModal() {

    const style = document.createElement('style');
    style.innerHTML = modalStyles;

    this.modalContainer = document.createElement('div');
    this.modalContainer.className = 'mo_mooni-container';

    this.iframeContainerElement = document.createElement('div');
    this.iframeContainerElement.id = `mooni-container-${Date.now()}`;
    this.iframeContainerElement.className = 'mo_mooni-frame';

    const widgetCloser = document.createElement('div');
    widgetCloser.className = 'mo_mooni-closer';
    widgetCloser.innerHTML = 'Close️';

    this.modalContainer.appendChild(this.iframeContainerElement);
    document.body.appendChild(this.modalContainer);
    document.head.appendChild(style);

    this.iframeContainerElement.appendChild(widgetCloser);

    widgetCloser.onclick = this.close.bind(this);

  }

  private createIframe() {

    this.iframeElement = document.createElement('iframe');

    this.iframeElement.style.flex = '1';
    this.iframeElement.style.border = '0 transparent';

    if(this.isModal) {
      this.iframeElement.style.borderRadius = '1rem';
      this.iframeContainerElement!.appendChild(this.iframeElement);
    } else {
      this.containerElement!.appendChild(this.iframeElement);
    }

  }

  public open() {
    if(!this.iframeElement!.src) {
      this.iframeElement!.src = this.getAppUrl();
    }
    if(this.isModal) {
      this.modalContainer!.style.display = 'flex';
    }

  }

  public close() {

    if(this.isModal) {
      this.modalContainer!.style.display = 'none';
    }

  }


  private getAppUrl() {
    let appUrl = this.appUrl;
    if(this.customToken) {
      appUrl += `?token=${this.customToken}`;
    }
    return appUrl;
  }

  private forwardWeb3Message(rawmessage: string, callback: any) {
    const message = JSON.parse(JSON.stringify(rawmessage));
    this.web3Provider.sendAsync(message, callback);
  }

  private listenWeb3Messages() {

    const appOrigin = new UrlParse(this.appUrl).origin;

    const web3MessageListener = async (e: any) => {
      if (e.data && e.data.jsonrpc === '2.0') {

        this.forwardWeb3Message(e.data, (error: any, result: any) => {
          if(this.iframeElement!.contentWindow) {
            if(error) {
              this.iframeElement!.contentWindow.postMessage({
                  ...result,
                  id: e.data.id,
                  error,
                },
                appOrigin
              );
            } else {
              this.iframeElement!.contentWindow.postMessage(
                {
                  ...result,
                  id: e.data.id,
                },
                appOrigin
              );
            }
          }
        });

      }
    };

    window.addEventListener('message', web3MessageListener);

  }

}



export default MooniWidget;
