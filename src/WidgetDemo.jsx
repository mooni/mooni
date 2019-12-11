import React from 'react';

import Root from './Root';
import styles from './WidgetDemo.module.css';

export default function Demo() {
  return  (
    <div className={styles.root}>
      <div className={styles.container}>
        <Root widget={true} />
      </div>
    </div>
  );
}
