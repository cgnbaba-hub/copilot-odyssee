import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'OdysseeWebPartStrings';
import content from '../../content/bundle.generated';
import { langFromCulture } from '../../core/i18n/locale';
import { LocalStorageProgressStore } from '../../core/progress/store';
import { App, AppProps } from '../../ui/App';

export interface IOdysseeWebPartProps {
  showDrafts: boolean;
}

export default class OdysseeWebPart extends BaseClientSideWebPart<IOdysseeWebPartProps> {
  private _store: LocalStorageProgressStore | undefined;

  public render(): void {
    // Until the SharePoint lists exist (AP 1.4), progress stays in the browser, per user.
    if (!this._store) {
      this._store = new LocalStorageProgressStore(`odyssee:${this.context.pageContext.user.loginName}`);
    }
    const element = React.createElement<AppProps>(App, {
      content,
      store: this._store,
      initialLang: langFromCulture(this.context.pageContext.cultureInfo.currentUICultureName),
      showDrafts: this.properties.showDrafts,
      demo: false
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
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
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
