import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneTextField, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'OdysseeWebPartStrings';
import bundledContent from '../../content/bundle.generated';
import { langFromCulture } from '../../core/i18n/locale';
import { LocalStorageProgressStore } from '../../core/progress/store';
import { connect, Connection } from '../../data/connect';
import { App, AppProps } from '../../ui/App';
import { SpRestClient } from './SpRestClient';

export interface IOdysseeWebPartProps {
  showDrafts: boolean;
  /** Site with the Odyssee lists; empty means the current site. */
  dataSiteUrl: string;
}

/** Saves are collected for this long before they are written to SharePoint. */
const SAVE_DELAY_MS = 1500;

/**
 * Pseudonymous player key: a SHA-256 hash of the Entra object id, so the
 * progress list never holds the plain id in its titles.
 */
async function playerKey(userId: string): Promise<string> {
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(`odyssee:${userId}`));
  return Array.prototype.map.call(new Uint8Array(digest), (b: number) => `0${b.toString(16)}`.slice(-2)).join('');
}

export default class OdysseeWebPart extends BaseClientSideWebPart<IOdysseeWebPartProps> {
  private _connection: Connection | undefined;
  private _connectedTo: string | undefined;
  private readonly _flush = (): void => {
    const store = this._connection && this._connection.store;
    if (store && 'flush' in store) (store as { flush(): Promise<void> }).flush().catch(() => undefined);
  };

  private get _webUrl(): string {
    return (this.properties.dataSiteUrl || '').trim() || this.context.pageContext.web.absoluteUrl;
  }

  private async _connect(): Promise<void> {
    const webUrl = this._webUrl;
    const page = this.context.pageContext;
    const userId = page.aadInfo && page.aadInfo.userId ? page.aadInfo.userId.toString() : page.user.loginName;
    const key = await playerKey(userId);
    this._connection = await connect({
      client: new SpRestClient(this.context.spHttpClient),
      webUrl,
      playerKey: key,
      bundledContent,
      browserStore: new LocalStorageProgressStore(`odyssee:${key}`),
      saveDelayMs: SAVE_DELAY_MS,
      log: (message, error) => console.warn(`[Odyssee] ${message}`, error)
    });
    this._connectedTo = webUrl;
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    window.addEventListener('pagehide', this._flush);
    try {
      await this._connect();
    } catch (error) {
      // Without a connection the game still runs, with bundled content and browser storage.
      console.error('[Odyssee] Verbindung fehlgeschlagen', error);
      this._connection = {
        content: bundledContent,
        contentSource: 'bundled',
        store: new LocalStorageProgressStore(`odyssee:${this.context.pageContext.user.loginName}`),
        storage: 'browser'
      };
      this._connectedTo = this._webUrl;
    }
  }

  public render(): void {
    if (this._connectedTo !== this._webUrl) {
      // The data site was changed in the property pane.
      this._connect().then(
        () => this.render(),
        (error) => console.error('[Odyssee] Verbindung fehlgeschlagen', error)
      );
      return;
    }
    const connection = this._connection as Connection;
    const element = React.createElement<AppProps>(App, {
      // A new key remounts the game when the data site changes.
      key: this._connectedTo,
      content: connection.content,
      store: connection.store,
      initialLang: langFromCulture(this.context.pageContext.cultureInfo.currentUICultureName),
      showDrafts: this.properties.showDrafts,
      storage: connection.storage
    } as AppProps & React.Attributes);
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    this._flush();
    window.removeEventListener('pagehide', this._flush);
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get disableReactivePropertyChanges(): boolean {
    // Reconnect only when the editor applies the settings, not on every keystroke.
    return true;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.ContentGroupName,
              groupFields: [
                PropertyPaneToggle('showDrafts', {
                  label: strings.ShowDraftsLabel,
                  onText: strings.On,
                  offText: strings.Off
                }),
                PropertyPaneTextField('dataSiteUrl', {
                  label: strings.DataSiteUrlLabel,
                  description: strings.DataSiteUrlDescription,
                  placeholder: 'https://…/sites/odyssee'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
