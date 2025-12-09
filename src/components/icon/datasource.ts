import { ICON_BASE_URL } from './constants';
import { getAssetPath } from '@stencil/core';
import { createCacheFetch } from '../../utils/utils';

export async function fetchIcon(name: string) {
  if (!name) return '';

  const cacheFetch = await createCacheFetch('pc-icons');

  let iconBaseUrl: string;
  if (process.env.THIRD_PARTY_ASSETS == 'LOCAL') {
    iconBaseUrl = getAssetPath('./assets/node_modules/@carbon/icons');
  } else {
    iconBaseUrl = ICON_BASE_URL;
  }

  return await cacheFetch(`${iconBaseUrl}/svg-500@0.40.1/outlined/${name}.svg`);
}
