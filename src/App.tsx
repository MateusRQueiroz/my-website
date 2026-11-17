import { useCallback, useEffect, useRef, useState } from 'react';
import { NavBar } from './components/NavBar';
import { Figure } from './components/Figure';
import { UniverseStage } from './universe/UniverseStage';
import { bus, type Move } from './universe/bus';
import { SHORT_TRAVEL, COURSE, type DestinationId, type ShotId } from './universe/layout';
import { CourseCaption } from './components/CourseCaption';
import { useHashRoute } from './hooks/useHashRoute';
import { prefersReducedMotion, useReducedMotion } from './hooks/useReducedMotion';
import { consumeClickNavigation } from './lib/navigation';
import { destinations, hrefFor, type Route, type ViewId } from './lib/routes';
import { profile } from './data/profile';
import { Universe } from './views/Universe';
import { Galaxy } from './views/Galaxy';
import { About } from './views/About';
import { Projects } from './views/Projects';
import { Experience } from './views/Experience';
import { Contact } from './views/Contact';

const shotOf = (v: ViewId): ShotId => (v === 'home' ? 'universe' : v);
const isSection = (v: ViewId) => v !== 'home' && v !== 'galaxy';


function targetFor(route: Route): HTMLElement | null {
  if (route.view !== 'projects' || !route.project) return null;
  return document.getElementById(route.project === 'experiments' ? 'experiments-title' : `${route.project}-title`);
}

export default function App() {
  const route = useHashRoute();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<ViewId>(route.view);
  const [move, setMove] = useState<Move>(() => ({ id: 0, shot: shotOf(route.view), kind: 'cut' }));
  const [scene, setScene] = useState<'loading' | 'webgl' | 'still'>('loading');
  const [revealed, setRevealed] = useState(route.view !== 'home');
  const [departing, setDeparting] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  /** A destination sequence in progress: aim (selection shown), then travel (camera moving). */
  const [course, setCourse] = useState<{ to: ViewId; phase: 'aim' | 'travel'; hidden?: boolean } | null>(null);

  const previous = useRef(route);
  const moveId = useRef(0);
  const travelId = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const pendingFocus = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const main = useRef<HTMLElement>(null);
  const sceneRef = useRef(scene); sceneRef.current = scene;
  const shownRef = useRef(shown); shownRef.current = shown;
  const courseRef = useRef(course); courseRef.current = course;

  const clearTimers = () => { timers.current.forEach(t => window.clearTimeout(t)); timers.current = []; };
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const focusSoon = () => { pendingFocus.current = true; setFocusTick(t => t + 1); };
  const motionOK = () => !prefersReducedMotion() && sceneRef.current === 'webgl';

  const enterGalaxy = () => { window.location.hash = hrefFor({ view: 'galaxy' }); };

  useEffect(() => {
    if (previous.current === route) return;
    const from = previous.current.view;
    previous.current = route;
    consumeClickNavigation();

    if (route.view === shownRef.current && !courseRef.current && travelId.current === null) { focusSoon(); return; }
    clearTimers();
    travelId.current = null;
    setDeparting(false);
    const id = ++moveId.current;

    if (!motionOK()) {
      // Reduced motion or the still fallback: arrive at once, no staging.
      setMove({ id, shot: shotOf(route.view), kind: 'cut' });
      setShown(route.view); setRevealed(route.view !== 'home'); setCourse(null); bus.set({ selected: null });
      focusSoon();
      return;
    }
    const target = shotOf(route.view);
    const travel = (duration: number | undefined, kind: Move['kind'] = 'glide') => {
      const tid = ++moveId.current;
      travelId.current = tid;
      setMove({ id: tid, shot: target, kind, duration });
      setShown(route.view);
      // Fallback in case the scene never reports arrival.
      later(() => onArriveRef.current(tid), (duration ?? COURSE.travel) + 1200);
    };

    if (isSection(route.view)) {
      // 1. The selected destination responds and the course is named, 2. the camera travels,
      // 3. the page appears only once the camera has settled.
      const fromSection = isSection(shownRef.current);
      const aim = from === 'home' ? COURSE.aimFromUniverse : fromSection ? COURSE.aimFromSection : COURSE.aimFromGalaxy;
      // If a previous travel is interrupted, its page was never shown; keep it hidden.
      const interrupted = courseRef.current?.phase === 'travel' || !!courseRef.current?.hidden;
      bus.set({ selected: route.view as DestinationId });
      setCourse({ to: route.view, phase: 'aim', hidden: interrupted });
      if (from === 'home') { setDeparting(true); later(() => setDeparting(false), 1900); }
      later(() => { setCourse({ to: route.view, phase: 'travel' }); travel(undefined); }, aim);
      return;
    }
    bus.set({ selected: null });
    setCourse(null);
    if (route.view === 'galaxy') {
      setRevealed(false);
      if (from === 'home') { setDeparting(true); later(() => setDeparting(false), 1900); travel(SHORT_TRAVEL, 'journey'); }
      else travel(undefined);
      focusSoon();
      return;
    }
    // Back out to the universe.
    travel(undefined);
    focusSoon();
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  const onArrive = useCallback((id: number) => {
    if (travelId.current !== id) return;
    travelId.current = null;
    setRevealed(true);
    if (courseRef.current) { setCourse(null); bus.set({ selected: null }); focusSoon(); }
  }, []);
  const onArriveRef = useRef(onArrive); onArriveRef.current = onArrive;
  // A preference change or WebGL failure during flight must also end staging.
  useEffect(() => {
    if ((reduced || scene === 'still') && (courseRef.current || travelId.current !== null)) {
      clearTimers(); travelId.current = null;
      setMove({ id: ++moveId.current, shot: shotOf(route.view), kind: 'cut' });
      setShown(route.view); setCourse(null); setDeparting(false);
      bus.set({ selected: null }); focusSoon();
    }
    if ((reduced || scene === 'still') && shown !== 'home') setRevealed(true);
  }, [scene, reduced, shown, route.view]);
  useEffect(() => { bus.set({ reveal: revealed && shown !== 'home' }); }, [revealed, shown]);
  useEffect(() => () => clearTimers(), []);
  useEffect(() => { document.title = destinations.find(d => d.id === route.view)!.title; }, [route.view]);

  useEffect(() => {
    if (!pendingFocus.current || course) return;
    pendingFocus.current = false;
    const anchor = targetFor(route);
    if (anchor) { anchor.scrollIntoView({ block: 'start' }); anchor.focus({ preventScroll: true }); }
    else { window.scrollTo({ top: 0 }); heading.current?.focus({ preventScroll: true }); }
  }, [focusTick, course, shown]); // eslint-disable-line react-hooks/exhaustive-deps

  const onReady = useCallback((mode: 'webgl' | 'still') => setScene(mode), []);
  const ambient = !reduced && !course && (shown === 'home' || shown === 'galaxy');
  const arriving = !!course && (course.phase === 'travel' || !!course.hidden);
  const leaving = !!course && course.phase === 'aim' && !course.hidden && isSection(shown);

  const view = (() => {
    switch (shown) {
      case 'home': return <Universe headingRef={heading} onEnter={enterGalaxy}/>;
      case 'galaxy': return <Galaxy headingRef={heading} revealed={revealed} selected={course?.to}/>;
      case 'about': return <About headingRef={heading}/>;
      case 'projects': return <Projects headingRef={heading} project={route.view === 'projects' ? route.project : undefined}/>;
      case 'experience': return <Experience headingRef={heading}/>;
      case 'contact': return <Contact headingRef={heading}/>;
    }
  })();

  return <div className={`app view-is-${shown}${isSection(shown) ? ' is-section' : ''}${arriving ? ' is-in-transit' : ''}`} data-scene={scene}>
    <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <UniverseStage move={move} ambient={ambient} view={shown} onReady={onReady} onArrive={onArrive}/>
    {(shown === 'home' || departing) && <Figure departing={departing}/>}
    <NavBar active={route.view}/>
    <main id="main" ref={main} tabIndex={-1} className="main">
      {course && <CourseCaption to={course.to} phase={course.phase}/>}
      <div className={`view-frame${arriving ? ' is-arriving' : ''}${leaving ? ' is-leaving' : ''}`} key={shown} inert={arriving || leaving || undefined} aria-busy={arriving || undefined}>{view}</div>
    </main>
    {isSection(shown) && !course && <footer className="site-footer">
      <span>© {new Date().getFullYear()} {profile.name}</span>
    </footer>}
  </div>;
}
