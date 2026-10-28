import { setIconBase } from './icon/datasource.js';

// The build copies Material Symbols into dist/icons/material-symbols/, beside this module.
setIconBase(
  'material-symbols',
  new URL('./icons/material-symbols/', import.meta.url),
);
