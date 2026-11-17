import { useEffect, useState } from 'react';
import { parseHash, type Route } from '../lib/routes';

function readRoute(): Route {
  const { route, canonical } = parseHash(window.location.hash);
  if (canonical !== null && canonical !== window.location.hash) {
    history.replaceState(history.state, '', canonical);
  }
  return route;
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const sync = () => {
      const next = readRoute();
      setRoute(current => current.view === next.view && current.project === next.project ? current : next);
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return route;
}
