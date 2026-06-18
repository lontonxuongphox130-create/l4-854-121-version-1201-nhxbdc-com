(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let index = slides.findIndex(function (slide) {
      return slide.classList.contains('active');
    });

    if (index < 0) {
      index = 0;
    }

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  function readSearchData() {
    const source = document.getElementById('search-data');
    if (!source) {
      return [];
    }

    try {
      return JSON.parse(source.textContent || '[]');
    } catch (error) {
      return [];
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const searchButton = document.querySelector('[data-search-button]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchData = readSearchData();

  function renderResults(query) {
    if (!searchResults) {
      return;
    }

    const text = query.trim().toLowerCase();
    if (!text) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }

    const hits = searchData.filter(function (item) {
      const haystack = [
        item.title,
        item.year,
        item.region,
        item.genre,
        item.summary,
        (item.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return haystack.indexOf(text) !== -1;
    }).slice(0, 18);

    if (!hits.length) {
      searchResults.classList.add('active');
      searchResults.innerHTML = '<div class="search-result"><span></span><p>没有找到匹配影片</p></div>';
      return;
    }

    searchResults.classList.add('active');
    searchResults.innerHTML = hits.map(function (item) {
      return [
        '<a class="search-result" href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span>',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<em>' + escapeHtml([item.year, item.region, item.genre].filter(Boolean).join(' · ')) + '</em>',
        '<p>' + escapeHtml(item.summary || '') + '</p>',
        '</span>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderResults(searchInput.value);
    });
  }

  if (searchButton && searchInput) {
    searchButton.addEventListener('click', function () {
      renderResults(searchInput.value);
    });
  }

  const libraryInput = document.querySelector('[data-library-input]');
  const libraryGrid = document.querySelector('[data-library-grid]');
  const filterWrap = document.querySelector('[data-filter-pills]');

  function applyLibraryFilter() {
    if (!libraryGrid) {
      return;
    }

    const activeFilter = filterWrap ? (filterWrap.querySelector('button.active') || {}).dataset.filter || 'all' : 'all';
    const term = libraryInput ? libraryInput.value.trim().toLowerCase() : '';
    const cards = Array.from(libraryGrid.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      const text = card.textContent.toLowerCase();
      const categoryMatch = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
      const queryMatch = !term || text.indexOf(term) !== -1;
      card.classList.toggle('hidden-by-filter', !(categoryMatch && queryMatch));
    });
  }

  if (filterWrap) {
    filterWrap.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-filter]');
      if (!button) {
        return;
      }

      filterWrap.querySelectorAll('button').forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      applyLibraryFilter();
    });
  }

  if (libraryInput) {
    libraryInput.addEventListener('input', applyLibraryFilter);
  }
})();
