import LogRocket from 'logrocket';

import config from '../config';
import { MetaError } from './errors';

if(process.env.NODE_ENV === 'production' && config.enableAnalytics) {
  LogRocket.init(
    config.logRocketId,
    {
      network: {
        isEnabled: false,
      },
    }
  );
}

export function track(eventName: string) {
  LogRocket.track(eventName);
}
export function identify(uid: string) {
  LogRocket.identify(uid);
}

function getPlausible() {
  // @ts-ignore
  return window.plausible ||
    function() {
      // @ts-ignore
      window.plausible = (
        // @ts-ignore
        window.plausible.q = window.plausible?.q || []
      ).push(arguments)
    };
}
export function sendEvent(name: string, props?: any) {
  if(config.enableAnalytics)
    getPlausible()(name, props)
}

export function captureError(message: string, error: Error) {
  LogRocket.captureMessage(message);
  LogRocket.captureException(error, {
    extra: {
      meta: (error as MetaError).meta,
    },
  });
}

export const logRocketMiddleware = LogRocket.reduxMiddleware({
  actionSanitizer: function (action) {
    return { type: action.type };
  },
  stateSanitizer: function (_) {
    return {};
  },
});
