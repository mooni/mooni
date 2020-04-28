const MooniWidget = require('@mooni/widget');

const mooni = new MooniWidget();

document.getElementById('modal-opener').onclick = () => mooni.open();
