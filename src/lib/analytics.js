import { useEffect }  from 'react';
import { useLocation }  from 'react-router-dom';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-68373171-8');

export function sendEvent(category, action, label, value) {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

export function usePageViews() {
  let location = useLocation();
  useEffect(() => {
    ReactGA.pageview(location.pathname);
  }, [location]);
}
