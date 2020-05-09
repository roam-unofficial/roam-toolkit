import { browser } from 'webextension-polyfill-ts';
import { Feature, Settings } from '../../utils/settings';

export const config: Feature = {
  id: 'custom-css',
  name: 'Custom CSS',
  settings: [{ type: 'large_string', id: 'css' }],
};

Settings.isActive('custom-css').then((active) => {
  if (active) {
    Settings.get('custom-css', 'css').then((value: string) => {
      setCss(value);
    });
  }
});

browser.runtime.onMessage.addListener(async (message) => {
  if (message?.featureId === 'custom-css') {
    setCss(message.value);
  }
});

const setCss = (value: string) => {
  if (document.getElementById('roam-custom-styles')) {
    document.getElementById('roam-custom-styles')!.innerHTML = value;
    return;
  }

  const style = document.createElement('style');
  style.id = 'roam-custom-styles';
  style.innerHTML = value;
  document.getElementsByTagName('head')[0].appendChild(style);
};
