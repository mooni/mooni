import styles from './styles';

const appUrl = 'https://mooni.now.sh/send';

const MooniWidget = {
  /**
   * Opens the Mooni widget as a modal.
   *
   * @returns {close} Function that will close the widget
   */
  open() {
    const style = document.createElement('style');
    style.innerHTML = styles;

    const container = document.createElement('div');
    container.className = 'mo_mooni-container';

    const widgetFrame = document.createElement('div');
    widgetFrame.id = `mooni-container-${Date.now()}`;
    widgetFrame.className = 'mo_mooni-frame';

    const widgetCloser = document.createElement('div');
    widgetCloser.className = 'mo_mooni-closer';
    widgetCloser.innerHTML = 'Close️';

    container.appendChild(widgetFrame);
    document.body.appendChild(container);
    document.head.appendChild(style);

    const iframe = document.createElement('iframe');

    iframe.src = appUrl;
    iframe.style.height = '100%';
    iframe.style.width = '100%';
    iframe.style.border = '0 transparent';
    iframe.style.borderRadius = '1rem';

    widgetFrame.appendChild(iframe);
    widgetFrame.appendChild(widgetCloser);

    const close = () => {
      document.body.removeChild(container);
      document.head.removeChild(style);
    };

    widgetCloser.onclick = close;

    return close;
  }
};

export default MooniWidget;
