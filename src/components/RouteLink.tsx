import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { hrefFor, type Route } from '../lib/routes';
import { markClickNavigation } from '../lib/navigation';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Route };

/** A plain hash link that also marks the navigation as started from inside the site. */
export function RouteLink({ to, onClick, ...rest }: Props) {
  return <a href={hrefFor(to)} {...rest} onClick={(event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) markClickNavigation();
  }}/>;
}
