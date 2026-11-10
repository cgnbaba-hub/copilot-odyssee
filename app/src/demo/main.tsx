import * as React from 'react';
import * as ReactDom from 'react-dom';

import content from '../content/bundle.generated';
import { langFromCulture } from '../core/i18n/locale';
import { DebouncedProgressStore } from '../core/progress/debounced';
import { LocalStorageProgressStore } from '../core/progress/store';
import { FeedbackEntry, FeedbackSender } from '../core/feedback/feedback';
import { FeedbackRecord } from '../core/admin/stats';
import { connectScorm } from '../data/scorm/ScormApi';
import { ScormProgressStore } from '../data/scorm/ScormProgressStore';
import { KIND_TITLES } from '../data/sharepoint/SharePointFeedbackSender';
import { App } from '../ui/App';
import { sampleAdminSource } from './sampleAdmin';
import { samplePinboard } from './samplePinboard';

/**
 * Set by the build: 'team' is the single HTML file for colleagues. It has no
 * sample evaluation and no sample harbour board, keeps its own progress, and
 * feedback goes to the contact address by email. 'scorm' is the same for an
 * LMS, which then keeps the progress (see docs/LMS.md).
 */
declare const __ODYSSEE_EDITION__: string;
const SCORM = __ODYSSEE_EDITION__ === 'scorm';
const TEAM = __ODYSSEE_EDITION__ === 'team' || SCORM;
const SHOW_DRAFTS = true;

/** Feedback sent in the demo; it shows up at the top of the evaluation. */
const demoSent: FeedbackRecord[] = [];

/** In the demo, feedback stays in this page: it appears in the evaluation and in the browser console. */
const demoFeedback: FeedbackSender = {
  send: (entry: FeedbackEntry) =>
    new Promise((resolve) => {
      console.info('[Odyssee-Demo] Feedback', entry);
      demoSent.unshift({
        kind: KIND_TITLES[entry.kind],
        message: entry.message,
        context: entry.context,
        profile: [entry.lang, entry.license, entry.area].filter((x) => !!x).join(' · '),
        created: new Date().toISOString()
      });
      window.setTimeout(resolve, 600);
    })
};

/**
 * In the LMS edition the progress goes to the LMS. Opened outside of one
 * (no SCORM API found) it keeps it in the browser and says so, like the demo.
 */
function lmsSetup(): { store: DebouncedProgressStore; storage: 'demo' | 'lms'; userName?: string } {
  const lms = connectScorm(window);
  const scormStore = new ScormProgressStore(lms, content, { showDrafts: SHOW_DRAFTS });
  const store = new DebouncedProgressStore(scormStore, 800);
  let done = false;
  // The LMS may close the frame at any time; the last state must reach it before the session ends.
  const leave = (): void => {
    if (done) return;
    done = true;
    store
      .flush()
      .catch(() => undefined)
      .then(() => scormStore.finish())
      .catch(() => undefined);
  };
  window.addEventListener('pagehide', leave);
  window.addEventListener('beforeunload', leave);
  // A page restored from the browser's back/forward cache has already ended its LMS session; a reload starts a new one.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload();
  });
  return { store, storage: lms ? 'lms' : 'demo', userName: scormStore.learnerName };
}

const lms = SCORM ? lmsSetup() : undefined;

/** Demo entry: runs the game in any browser with the bundled content, no tenant needed. */
// The demo page owns the whole document and never unmounts the app.
// eslint-disable-next-line @rushstack/pair-react-dom-render-unmount
ReactDom.render(
  <App
    content={content}
    store={lms ? lms.store : new DebouncedProgressStore(new LocalStorageProgressStore(TEAM ? 'odyssee-team' : 'odyssee-demo'), 800)}
    initialLang={langFromCulture(navigator.language)}
    showDrafts={SHOW_DRAFTS}
    storage={lms ? lms.storage : 'demo'}
    userName={lms ? lms.userName : undefined}
    feedback={TEAM ? undefined : demoFeedback}
    admin={TEAM ? undefined : sampleAdminSource(content, () => demoSent)}
    pinboard={TEAM ? undefined : samplePinboard()}
    // In the demo a missed question can be brushed up at once; afterwards it waits three days.
    reviewIntervals={TEAM ? undefined : [0, 3]}
  />,
  document.getElementById('root')
);
