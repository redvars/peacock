const $componentSearchElm = document.getElementById('component-search');

setTimeout(() => {
  $componentSearchElm.setFocus();
}, 80);

$componentSearchElm.addEventListener('goat-input--input', function (e) {
  window.scrollTo({
    top: 0,
    behavior: 'instant',
  });
  document.querySelectorAll('.cards .card-wrapper').forEach(elm => {
    elm.classList.remove('hidden');
    if (elm.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1) {
      elm.classList.add('hidden');
    }
  });
});
if (window.location.href.indexOf('?filter=') !== -1) {
  const filter = new URLSearchParams(window.location.search).get('filter');
  if (filter) {
    document.querySelector('#tag-' + filter).selected = true;
    document.querySelector('.filters').classList.remove('hidden');
  }
  document.querySelectorAll('.card-wrapper').forEach(elm => {
    elm.classList.add('hidden-force');
    if (elm.getAttribute('data-category') === filter) {
      elm.classList.remove('hidden-force');
    }
  });
}

document.addEventListener('scroll', function () {
  const scrollPosition = window.scrollY;
  const header = document.querySelector('#search-container');
  if (scrollPosition > 0) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

const cardHeaders = document.querySelectorAll('.card-header');

cardHeaders.forEach(box => {
  box.addEventListener('click', function handleClick(event) {
    if (event.ctrlKey || event.metaKey) {
      window.open(`/components/${event.target.getAttribute('data-tag').replace('goat-', '')}/#`, '_blank');
      return;
    }
    window.location.href = `/components/${event.target.getAttribute('data-tag').replace('goat-', '')}/#`;
  });
});
