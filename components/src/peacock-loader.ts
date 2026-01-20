// Eager loaded
import { Icon } from './icon/icon.js';
import { LoaderConfig, LoaderUtils } from './LoaderUtils.js';

const loaderConfig: LoaderConfig = {
  prefix: 'p',
  components: {
    icon: {
      CustomElementClass: Icon,
    },
    avatar: {
      importPath: './component/avatar.js',
    },
  },
};

new LoaderUtils(loaderConfig).start();
