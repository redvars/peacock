(function () {
  'use strict';

  // @ts-ignore
  window.myConsole = {
    log: function (message, title) {
      console.log(message);
      window.dispatchEvent(
        new CustomEvent('pc-notification', {
          detail: {
            title: title ? title : undefined,
            subtitle: `<pre>${message}</pre>`,
            state: 'success',
          },
        }),
      );
    },
    warn: function (message, title) {
      console.warn(message);
      window.dispatchEvent(
        new CustomEvent('pc-notification', {
          detail: {
            title: title ? title : undefined,
            subtitle: `<pre>${message}</pre>`,
            state: 'warning',
          },
        }),
      );
    },
  };

  const registerThemeSwitcher = (() => {
    function setTheme($themeSwitcher, theme) {
      document.documentElement.setAttribute('data-theme', theme);
      $themeSwitcher.querySelector('.icon').name =
        theme === 'dark' ? 'dark_mode' : 'light_mode';
      localStorage.setItem('theme', theme);
    }

    return function ($themeSwitcher) {
      if (!$themeSwitcher) {
        console.warn('Theme switcher not found');
        return;
      }
      const theme = localStorage.getItem('theme') || 'light';
      setTheme($themeSwitcher, theme);
      $themeSwitcher.addEventListener('click', function () {
        const theme =
          localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
        setTheme($themeSwitcher, theme);
      });
    };
  })();

  const registerDirSwitcher = (() => {
    function setDir($dirSwitcher, dir) {
      document.documentElement.setAttribute('dir', dir);
      $dirSwitcher.querySelector('.icon').name =
        dir === 'ltr'
          ? 'format_textdirection_l_to_r'
          : 'format_textdirection_r_to_l';
      localStorage.setItem('dir', dir);
    }

    return function ($dirSwitcher) {
      if (!$dirSwitcher) {
        console.warn('Dir switcher not found');
        return;
      }
      const dir = localStorage.getItem('dir') || 'ltr';
      setDir($dirSwitcher, dir);
      $dirSwitcher.addEventListener('click', function () {
        const dir = localStorage.getItem('dir') === 'ltr' ? 'rtl' : 'ltr';
        setDir($dirSwitcher, dir);
      });
    };
  })();

  document.addEventListener('DOMContentLoaded', function () {
    registerThemeSwitcher(document.querySelector('.theme-switcher'));
    registerDirSwitcher(document.querySelector('.dir-switcher'));
  });
})();
