import * as React from 'react';
import * as ReactDom from 'react-dom';

import content from '../content/bundle.generated';
import { langFromCulture } from '../core/i18n/locale';
import { LocalStorageProgressStore } from '../core/progress/store';
import { FeedbackEntry, FeedbackSender } from '../core/feedback/feedback';
import { App } from '../ui/App';

/** In the demo, feedback only goes to the browser console. */
const demoFeedback: FeedbackSender = {
  send: (entry: FeedbackEntry) =>
    new Promise((resolve) => {
      console.info('[Odyssee-Demo] Feedback', entry);
      window.setTimeout(resolve, 600);
    })
};

/** Demo entry: runs the game in any browser with the bundled content, no tenant needed. */
// The demo page owns the whole document and never unmounts the app.
// eslint-disable-next-line @rushstack/pair-react-dom-render-unmount
ReactDom.render(
  <App
    content={content}
    store={new LocalStorageProgressStore('odyssee-demo')}
    initialLang={langFromCulture(navigator.language)}
    showDrafts={true}
    storage="demo"
    feedback={demoFeedback}
  />,
  document.getElementById('root')
);
