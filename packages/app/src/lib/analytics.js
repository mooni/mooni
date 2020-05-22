import { useEffect }  from 'react';
import { useLocation }  from 'react-router-dom';
import ReactGA from 'react-ga';
import LogRocket from 'logrocket';

if(process.env.NODE_ENV === 'production') {
  LogRocket.init(
    '282s2e/mooni',
    {
      network: {
        isEnabled: false,
      },
    }
  );
  ReactGA.initialize('UA-68373171-8');
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

export function track(eventName) {
  LogRocket.track(eventName);
}

export function sendEvent(category, action, label, value) {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

export function captureError(message, error) {
  LogRocket.captureMessage(message);
  LogRocket.captureException(error);
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
