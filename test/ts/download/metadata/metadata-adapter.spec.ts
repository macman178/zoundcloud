import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {TrackMetadataFactory} from '@src/download/metadata/track-metadata-factory';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {configureChai, useRxTesting} from '@test/test-initializers';
import {of} from 'rxjs';
import {restore, SinonStub, stub} from 'sinon';

const expect = configureChai();

describe('metadata adapter', () => {
  const rx = useRxTesting();

  const fixture = MetadataAdapter;
  let inputDlInfo: ITrackDownloadInfo;
  let stubCreateMetadata: SinonStub;
  let stubAddIDV2Metadata: SinonStub;

  beforeEach(() => {
    inputDlInfo = {downloadOptions: {}, trackInfo: {}} as ITrackDownloadInfo;
    stubCreateMetadata = stub(TrackMetadataFactory, 'create');
    stubAddIDV2Metadata = stub(ID3MetadataService, 'addID3V2Metadata$');
  });

  afterEach(() => {
    restore();
  });

  describe('adding metadata', () => {
    it('should add id3 metadata when downloading a mp3 file', () => {
      inputDlInfo.downloadOptions.filename = 'file.name.mp3';
      const metadata = {title: 'foo'} as ITrackMetadata;
      const expectedDlInfo = {trackInfo: {title: 'bar'}} as ITrackDownloadInfo;

      stubCreateMetadata.withArgs(inputDlInfo.trackInfo).returns(metadata);
      stubAddIDV2Metadata.withArgs(metadata, inputDlInfo).returns(of(expectedDlInfo));

      rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
      expect(rx.next).to.be.calledOnceWithExactly(expectedDlInfo);
      expect(rx.complete).to.be.called;
    });

    it('should not add metadata when not downloading a mp3 file', () => {
      inputDlInfo.downloadOptions.filename = 'file.name.wav';

      rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
      expect(rx.next).to.be.calledOnceWithExactly(inputDlInfo);
      expect(rx.complete).to.be.called;
    });
  });
});
