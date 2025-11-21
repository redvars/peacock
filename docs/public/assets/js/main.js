(function () {
  'use strict';

  // @ts-ignore
  window.myConsole = {
    log: function (message, title) {
      window.dispatchEvent(
        new CustomEvent('goat-notification', {
          detail: {
            title: title ? title : undefined,
            subtitle: `<pre>${message}</pre>`,
            state: 'success',
          },
        }),
      );
    },
    warn: function (message, title) {
      window.dispatchEvent(
        new CustomEvent('goat-notification', {
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
      $themeSwitcher.icon = theme === 'dark' ? 'asleep--filled' : 'sun';
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
        const theme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
        setTheme($themeSwitcher, theme);
      });
    };
  })();

  const registerDirSwitcher = (() => {
    function setDir($dirSwitcher, dir) {
      document.documentElement.setAttribute('dir', dir);
      $dirSwitcher.textContent = dir.toUpperCase();
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

  const registerHeaderMenu = (() => {
    return function () {
      const $headerMenu = document.querySelector('#header-menu');
      if (!$headerMenu) {
        console.warn('Header menu not found');
        return;
      }
      const $headerMenuBtn = document.querySelector('#header-menu-btn');
      $headerMenuBtn.addEventListener('goat-button--click', function () {
        $headerMenu.classList.add('show');
        $headerMenu.querySelectorAll('goat-menu-item')[0].setFocus();
        document.body.classList.add('stop-scroll');
      });

      const $headerMenuCloseBtn = document.querySelector('#header-menu-close-btn');
      $headerMenuCloseBtn.addEventListener('goat-button--click', function () {
        $headerMenu.classList.remove('show');
        document.body.classList.remove('stop-scroll');
      });

      const $headerMenuItems = $headerMenu.querySelectorAll('goat-menu-item');
      $headerMenuItems.forEach($item => {
        $item.addEventListener('goat-menu-item--click', function () {
          $headerMenu.classList.remove('show');
          document.body.classList.remove('stop-scroll');
        });
      });
    };
  })();

  document.addEventListener('DOMContentLoaded', function () {
    registerThemeSwitcher(document.querySelector('.theme-switcher'));
    registerDirSwitcher(document.querySelector('.dir-switcher'));
    registerHeaderMenu();
  });
})();
