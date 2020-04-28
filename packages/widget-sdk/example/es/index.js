import MooniWidget from '@mooni/widget';

const mooni = new MooniWidget();

document.getElementById('modal-opener').onclick = () => mooni.open();
