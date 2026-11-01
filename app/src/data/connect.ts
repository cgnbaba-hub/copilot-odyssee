import { AdminSource } from '../core/admin/source';
import { ContentBundle } from '../core/content/types';
import { FeedbackSender } from '../core/feedback/feedback';
import { PinboardSource } from '../core/pinboard/pinboard';
import { DebouncedProgressStore } from '../core/progress/debounced';
import { ProgressStore } from '../core/progress/store';
import { RestClient } from './RestClient';
import { SharePointAdminSource } from './sharepoint/SharePointAdminSource';
import { SharePointContentSource } from './sharepoint/SharePointContentSource';
import { SharePointFeedbackSender } from './sharepoint/SharePointFeedbackSender';
import { SharePointPinboardSource } from './sharepoint/SharePointPinboardSource';
import { SharePointProgressStore } from './sharepoint/SharePointProgressStore';

/** Where progress ends up; shown to the player when it is not SharePoint. */
export type StorageMode = 'sharepoint' | 'browser';

export interface Connection {
  content: ContentBundle;
  contentSource: 'sharepoint' | 'bundled';
  store: ProgressStore;
  storage: StorageMode;
  /** Missing while the feedback list has not been set up. */
  feedback?: FeedbackSender;
  /** Missing while the harbour board's lists have not been set up. */
  pinboard?: PinboardSource;
  /** Only for people who may see every entry, e.g. the site owners. */
  admin?: AdminSource;
}

export interface ConnectOptions {
  client: RestClient;
  /** Site that holds the lists created by Setup-Odyssee.ps1. */
  webUrl: string;
  playerKey: string;
  bundledContent: ContentBundle;
  /** Used while the SharePoint lists are missing, e.g. before provisioning. */
  browserStore: ProgressStore;
  saveDelayMs: number;
  log?: (message: string, error?: unknown) => void;
}

/**
 * Connects the game to SharePoint, falling back to the bundled content and
 * the browser store when the library or list is not there (yet). Progress
 * that was kept in the browser moves to SharePoint once the list exists.
 */
export async function connect(options: ConnectOptions): Promise<Connection> {
  const log = options.log || (() => undefined);

  let content = options.bundledContent;
  let contentSource: Connection['contentSource'] = 'bundled';
  try {
    content = await new SharePointContentSource(options.client, options.webUrl).load();
    contentSource = 'sharepoint';
  } catch (error) {
    log('Inhalte aus SharePoint nicht verfügbar, verwende mitgelieferte Inhalte', error);
  }

  let feedback: FeedbackSender | undefined;
  const feedbackSender = new SharePointFeedbackSender(options.client, options.webUrl);
  try {
    await feedbackSender.checkList();
    feedback = feedbackSender;
  } catch (error) {
    log('Feedback-Liste nicht verfügbar, Feedback nur per E-Mail', error);
  }

  let pinboard: PinboardSource | undefined;
  const pinboardSource = new SharePointPinboardSource(options.client, options.webUrl);
  try {
    await pinboardSource.checkLists();
    pinboard = pinboardSource;
  } catch (error) {
    log('Pinnwand-Listen nicht verfügbar, Pinnwand ausgeblendet', error);
  }

  const sharePointStore = new SharePointProgressStore(options.client, options.webUrl, options.playerKey);
  try {
    await sharePointStore.checkList();
  } catch (error) {
    log('Fortschrittsliste nicht verfügbar, speichere im Browser', error);
    return { content, contentSource, store: options.browserStore, storage: 'browser', feedback, pinboard };
  }

  let admin: AdminSource | undefined;
  const adminSource = new SharePointAdminSource(options.client, options.webUrl);
  try {
    if (await adminSource.isAllowed()) admin = adminSource;
  } catch (error) {
    log('Berechtigung für die Auswertung nicht prüfbar', error);
  }

  try {
    const [remote, local] = await Promise.all([sharePointStore.load(), options.browserStore.load()]);
    if (!remote && local) {
      await sharePointStore.save(local);
      await options.browserStore.clear();
    }
  } catch (error) {
    log('Übernahme des Browser-Fortschritts fehlgeschlagen', error);
  }

  return { content, contentSource, store: new DebouncedProgressStore(sharePointStore, options.saveDelayMs), storage: 'sharepoint', feedback, pinboard, admin };
}
