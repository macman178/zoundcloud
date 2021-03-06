import * as $ from 'jquery';
import {clock, match, restore, useFakeTimers} from 'sinon';
import {defaultOptions} from 'src/ts/options/default-options';
import {IOptions} from 'src/ts/options/option';
import {OptionsScript} from 'src/ts/options/options-script';
import {configureChai, useSinonChrome} from 'test/ts/test-initializers';

const expect = configureChai();
const HTML_KEY = '__html__';
const optionsHTML = (window as any)[HTML_KEY]['options.html'];

describe('options script', () => {
  const sinonChrome = useSinonChrome();
  let fixture: OptionsScript;

  // values should differ from default options
  const mockOptions: IOptions = Object.freeze({
    addMetadata: false,
    alwaysDownloadMp3: true,
    cleanTrackTitle: {
      enabled: false,
      pattern: 'abcdefg',
    },
    overwriteExistingFiles: true,
  });

  beforeEach(() => {
    useFakeTimers();

    document.body.innerHTML = optionsHTML;
    sinonChrome.storage.sync.get.withArgs(defaultOptions, match.any).yields(defaultOptions);
    fixture = new OptionsScript();
  });

  afterEach(() => {
    restore();
  });

  context('when script is run', () => {
    it('should restore to the default options if there were no saved options', () => {
      fixture.run();
      verifyHTMLState(defaultOptions);
    });

    it('should restore options from Chrome storage if there were saved options', () => {
      sinonChrome.storage.sync.get.withArgs(defaultOptions, match.any).yields(mockOptions);
      fixture.run();
      verifyHTMLState(mockOptions);
    });
  });

  context('when the clean title option checkbox is clicked', () => {
    beforeEach(() => {
      fixture.run();
    });

    it('should enable the clean title pattern input when checkbox is checked', () => {
      setHTMLState({...mockOptions, cleanTrackTitle: {enabled: false, pattern: ''}});
      $('#clean-title-option').trigger('click');
      expect($('#clean-title-pattern')).to.have.$prop('disabled', false);
    });

    it('should disable the clean title pattern input when checkbox is unchecked', () => {
      setHTMLState({...mockOptions, cleanTrackTitle: {enabled: true, pattern: ''}});
      $('#clean-title-option').trigger('click');
      expect($('#clean-title-pattern')).to.have.$prop('disabled', true);
    });
  });

  context('when the save button is clicked', () => {
    beforeEach(() => {
      fixture.run();
    });

    it('should save options to Chrome storage', () => {
      setHTMLState(mockOptions);
      $('#save-btn').trigger('click');
      expect(sinonChrome.storage.sync.set).to.have.been.calledOnceWithExactly(mockOptions);
    });

    it('should show the confirmation message', () => {
      testConfirmMsgWhenBtnIsClicked($('#save-btn'));
    });
  });

  context('when the reset button is clicked', () => {
    beforeEach(() => {
      fixture.run();
      setHTMLState(mockOptions);
    });

    it('should set options on the page to reflect the default options', () => {
      $('#defaults-btn').trigger('click');
      verifyHTMLState(defaultOptions);
    });
  });

  function testConfirmMsgWhenBtnIsClicked(button: JQuery<HTMLElement>) {
    const confirmMsg = $('#confirm-msg');
    expect(confirmMsg).to.be.$hidden;
    button.trigger('click');
    expect(confirmMsg).to.be.$visible;
    clock.tick(1500); // 1s + 400ms fade out animation + 100ms room for error
    expect(confirmMsg).to.be.$hidden;
  }

  function setHTMLState(options: IOptions) {
    $('#add-metadata-option').prop('checked', options.addMetadata);
    $('#always-mp3-option').prop('checked', options.alwaysDownloadMp3);
    $('#clean-title-option').prop('checked', options.cleanTrackTitle.enabled);
    const cleanTitlePattern = $('#clean-title-pattern');
    cleanTitlePattern.val(options.cleanTrackTitle.pattern);
    cleanTitlePattern.prop('disabled', !options.cleanTrackTitle.enabled);
    $('#overwrite-option').prop('checked', options.overwriteExistingFiles);
  }

  function verifyHTMLState(options: IOptions) {
    expect($('#add-metadata-option')).to.have.$prop('checked', options.addMetadata);
    expect($('#always-mp3-option')).to.have.$prop('checked', options.alwaysDownloadMp3);
    expect($('#clean-title-option')).to.have.$prop('checked', options.cleanTrackTitle.enabled);
    expect($('#clean-title-pattern')).to.have.$val(options.cleanTrackTitle.pattern);
    expect($('#overwrite-option')).to.have.$prop('checked', options.overwriteExistingFiles);
  }
});
