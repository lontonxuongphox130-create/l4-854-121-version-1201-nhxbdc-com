const mobileButton = document.querySelector('[data-mobile-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (mobileButton && mobileNav) {
  mobileButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    mobileButton.setAttribute('aria-expanded', String(isOpen));
    mobileButton.textContent = isOpen ? '×' : '☰';
  });
}

function setupHeroSlider() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.hero-dot'));
  const previous = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === current);
      dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
    });
  }

  function startTimer() {
    if (slides.length <= 1) {
      return;
    }
    stopTimer();
    timer = window.setInterval(() => showSlide(current + 1), 5600);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startTimer();
    });
  });

  if (previous) {
    previous.addEventListener('click', () => {
      showSlide(current - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showSlide(current + 1);
      startTimer();
    });
  }

  hero.addEventListener('mouseenter', stopTimer);
  hero.addEventListener('mouseleave', startTimer);
  showSlide(0);
  startTimer();
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function setupFilters() {
  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach((panel) => {
    const scopeSelector = panel.getAttribute('data-filter-scope') || 'body';
    const scope = document.querySelector(scopeSelector) || document;
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
    const search = panel.querySelector('.site-search');
    const region = panel.querySelector('.region-filter');
    const year = panel.querySelector('.year-filter');
    const type = panel.querySelector('.type-filter');
    const count = panel.querySelector('.filter-count');
    const empty = scope.querySelector('.empty-result');

    function applyFilters() {
      const q = normalizeText(search ? search.value : '');
      const regionValue = normalizeText(region ? region.value : '');
      const yearValue = normalizeText(year ? year.value : '');
      const typeValue = normalizeText(type ? type.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalizeText(card.dataset.search);
        const cardRegion = normalizeText(card.dataset.region);
        const cardYear = normalizeText(card.dataset.year);
        const cardType = normalizeText(card.dataset.type);
        const matchesQuery = !q || haystack.includes(q);
        const matchesRegion = !regionValue || cardRegion.includes(regionValue);
        const matchesYear = !yearValue || cardYear === yearValue;
        const matchesType = !typeValue || cardType.includes(typeValue);
        const isVisible = matchesQuery && matchesRegion && matchesYear && matchesType;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `显示 ${visible} / ${cards.length} 部`;
      }
      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    [search, region, year, type].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
}

async function startVideoPlayer(player) {
  const video = player.querySelector('video');
  const overlay = player.querySelector('.player-overlay');
  const status = player.parentElement.querySelector('.player-status');
  const source = player.getAttribute('data-src');

  if (!video || !source) {
    if (status) {
      status.textContent = '播放源暂不可用。';
    }
    return;
  }

  if (overlay) {
    overlay.hidden = true;
  }
  video.controls = true;

  function updateStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  try {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      await video.play();
      updateStatus('正在使用浏览器原生 HLS 播放。');
      return;
    }

    const module = await import('./hls-vendor-dru42stk.js');
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      const playWhenReady = () => {
        video.play().then(() => {
          updateStatus('HLS 播放器已启动，正在加载影片。');
        }).catch(() => {
          updateStatus('播放器已就绪，请点击视频画面继续播放。');
        });
      };

      if (Hls.Events && Hls.Events.MANIFEST_PARSED) {
        hls.on(Hls.Events.MANIFEST_PARSED, playWhenReady);
      } else {
        window.setTimeout(playWhenReady, 500);
      }

      if (Hls.Events && Hls.Events.ERROR) {
        hls.on(Hls.Events.ERROR, (eventName, data) => {
          if (data && data.fatal) {
            updateStatus('播放遇到网络或媒体错误，请稍后重试。');
          }
        });
      }
      return;
    }

    video.src = source;
    await video.play();
    updateStatus('正在尝试直接播放视频源。');
  } catch (error) {
    updateStatus('浏览器阻止了自动播放，请再次点击视频画面。');
    if (overlay) {
      overlay.hidden = false;
    }
  }
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));
  players.forEach((player) => {
    const overlay = player.querySelector('.player-overlay');
    const handler = () => startVideoPlayer(player);
    if (overlay) {
      overlay.addEventListener('click', handler);
    }
    player.addEventListener('dblclick', handler);
  });
}

setupHeroSlider();
setupFilters();
setupPlayers();
