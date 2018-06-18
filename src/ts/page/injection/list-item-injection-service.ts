import {ZC_DL_BUTTON_SMALL_CLASS} from '@src/constants';
import {DownloadButtonFactory} from '@src/page/injection/download-button-factory';
import {addToButtonGroup} from '@src/page/injection/injection-commons';
import {InjectionSignalFactory} from '@src/page/injection/injection-signal-factory';
import {Subscription} from 'rxjs';

export const ListItemInjectionService = {
  injectDownloadButtons(subscriptions: Subscription) {
    const selector = '.soundList__item, .searchList__item, .trackList__item, .chartTracks__item';
    subscriptions.add(
      InjectionSignalFactory.create$(selector)
        .subscribe(addToListItem.bind(null, subscriptions))
    );
  }
};

function addToListItem(subscriptions: Subscription, listItem: JQuery<HTMLElement>): void {
  const downloadInfoUrl = listItem
    .find('.soundTitle__title, .trackItem__trackTitle, .chartTrack__title > a')
    .first().prop('href');
  const downloadButton = DownloadButtonFactory.create(subscriptions, downloadInfoUrl)
    .addClass(['sc-button-small', ZC_DL_BUTTON_SMALL_CLASS]);
  const buttonGroup = listItem.find('.soundActions .sc-button-group');
  addToButtonGroup(downloadButton, buttonGroup);
}