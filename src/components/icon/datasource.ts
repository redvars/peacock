import { ICON_BASE_URL } from './constants';
import { getAssetPath } from '@stencil/core';
import { createCacheFetch } from '../../utils/utils';

export async function fetchIcon(name: string) {
  if (!name) return '';

  let iconBaseUrl: string;
  if (process.env.THIRD_PARTY_ASSETS == 'LOCAL') {
    iconBaseUrl = getAssetPath('./assets/node_modules/@carbon/icons');
  } else {
    iconBaseUrl = ICON_BASE_URL;
  }

  return await fetchSVG(`${iconBaseUrl}/svg-500@0.40.1/outlined/${name}.svg`);
}

export async function fetchSVG(url) {
  if (!url) return '';

  const cacheFetch = await createCacheFetch('svg-cache');

  return await cacheFetch(url);
}
