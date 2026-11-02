import * as React from 'react';
import * as ReactDom from 'react-dom';

import content from '../content/bundle.generated';
import { langFromCulture } from '../core/i18n/locale';
import { DebouncedProgressStore } from '../core/progress/debounced';
import { LocalStorageProgressStore } from '../core/progress/store';
import { FeedbackEntry, FeedbackSender } from '../core/feedback/feedback';
import { FeedbackRecord } from '../core/admin/stats';
import { KIND_TITLES } from '../data/sharepoint/SharePointFeedbackSender';
import { App } from '../ui/App';
import { sampleAdminSource } from './sampleAdmin';
import { samplePinboard } from './samplePinboard';

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

/** Demo entry: runs the game in any browser with the bundled content, no tenant needed. */
// The demo page owns the whole document and never unmounts the app.
// eslint-disable-next-line @rushstack/pair-react-dom-render-unmount
ReactDom.render(
  <App
    content={content}
    store={new DebouncedProgressStore(new LocalStorageProgressStore('odyssee-demo'), 800)}
    initialLang={langFromCulture(navigator.language)}
    showDrafts={true}
    storage="demo"
    feedback={demoFeedback}
    admin={sampleAdminSource(content, () => demoSent)}
    pinboard={samplePinboard()}
    // In the demo a missed question can be brushed up at once; afterwards it waits three days.
    reviewIntervals={[0, 3]}
  />,
  document.getElementById('root')
);
