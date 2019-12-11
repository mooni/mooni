import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';

const MooniWidget = {
  mount(element, props = {}) {
    ReactDOM.render(<Root {...props} widget={true} />, element);
  },
  unMount(element) {
    ReactDOM.unmountComponentAtNode(element);
  },
};

export default MooniWidget;
window.MooniWidget = MooniWidget;

export function MooniWidgetComponent() {
  const container = useRef();

  useEffect(() => {
    MooniWidget.mount(container.current);
    return () => MooniWidget.unMount(container.current);
  }, [container]);

  return (
    <div ref={container} />
  );
}

