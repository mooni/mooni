import { useEffect }  from 'react';
import { useLocation }  from 'react-router-dom';
import ReactGA from 'react-ga';
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
  ReactGA.initialize(config.gtagId);
  ReactGA.event({
    category: 'source',
    action: 'app',
  });
  LogRocket.getSessionURL(function (sessionURL) {
    ReactGA.event({
      category: 'LogRocket',
      action: sessionURL,
    });
  });
}

export function track(eventName: string) {
  LogRocket.track(eventName);
}
export function identify(uid: string) {
  LogRocket.identify(uid);
}

export function sendEvent(category: string, action: string, label?: string, value?: number) {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

export function captureError(message: string, error: Error) {
  LogRocket.captureMessage(message);
  LogRocket.captureException(error, {
    extra: {
      meta: (error as MetaError).meta,
    },
  });
}

export function usePageViews() {
  let location = useLocation();
  useEffect(() => {
    ReactGA.pageview(location.pathname);
  }, [location]);
}

export const logRocketMiddleware = LogRocket.reduxMiddleware({
  actionSanitizer: function (action) {
    return { type: action.type };
  },
  stateSanitizer: function (_) {
    return {};
  },
});
