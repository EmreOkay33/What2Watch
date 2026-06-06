<script>
  import { sampleMovies } from '$lib/movies';
  import { favorites, customMovies } from '$lib/stores';
  import { get } from 'svelte/store';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { data } = $props();

  // 'movie' | 'series'
  let activeType = $state('movie');

  // Empfehlungen ein/aus — in localStorage gespeichert
  function loadRecommendPref() {
    try { return localStorage.getItem('what2watch-recommend') !== 'off'; } catch { return true; }
  }
  let recommendEnabled = $state(loadRecommendPref());
  function toggleRecommend() {
    recommendEnabled = !recommendEnabled;
    try { localStorage.setItem('what2watch-recommend', recommendEnabled ? 'on' : 'off'); } catch {}
    deck = buildDeck(activeType);
  }

  // ── Skipped-Movie Persistenz ──
  const SKIP_KEY = 'what2watch-skipped';

  function getSkipped(type) {
    try {
      const s = localStorage.getItem(SKIP_KEY);
      const d = s ? JSON.parse(s) : {};
      return new Set(d[type] ?? []);
    } catch { return new Set(); }
  }

  function addSkipped(type, id) {
    try {
      const s = localStorage.getItem(SKIP_KEY);
      const d = s ? JSON.parse(s) : {};
      const arr = d[type] ?? [];
      if (!arr.includes(id)) arr.push(id);
      d[type] = arr;
      localStorage.setItem(SKIP_KEY, JSON.stringify(d));
    } catch {}
  }

  function clearSkipped(type) {
    try {
      const s = localStorage.getItem(SKIP_KEY);
      const d = s ? JSON.parse(s) : {};
      d[type] = [];
      localStorage.setItem(SKIP_KEY, JSON.stringify(d));
    } catch {}
  }

  function getTopGenres(type) {
    const favList = get(favorites);
    const relevant = type === 'series'
      ? favList.filter(f => f.type === 'series')
      : favList.filter(f => !f.type || f.type === 'movie');
    const counts = {};
    for (const f of relevant) {
      if (f.genre) counts[f.genre] = (counts[f.genre] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);
  }

  function buildDeck(type) {
    const favIds    = new Set(get(favorites).map(f => f.id));
    const skippedIds = getSkipped(type);
    const topGenres  = getTopGenres(type);

    const all = type === 'series'
      ? data.series.filter(m => !favIds.has(m.id))
      : [...get(customMovies), ...data.movies].filter(m => !favIds.has(m.id));

    let fresh = all.filter(m => !skippedIds.has(m.id));
    const later = all.filter(m => skippedIds.has(m.id));

    // Anzahl übersprungener Filme merken (für Prompt im Template)
    skippedCount = later.length;

    // Empfehlungs-Sortierung nur auf frische Filme anwenden
    if (recommendEnabled && topGenres.length > 0) {
      fresh = fresh.map(m => ({ ...m, recommended: topGenres.includes(m.genre) }));
      fresh.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    }

    // Nur frische Filme ins Deck — übersprungene kommen erst nach Zustimmung
    return fresh;
  }

  let skippedCount = $state(0);
  let skipPromptDismissed = $state(false);

  let deck = $state(buildDeck('movie'));
  let message = $state('');
  let isAnimating = $state(false);
  let swipeDir = $state(null);

  // ── Touch / Drag ──
  let dragX = $state(0);
  let isDragging = $state(false);
  let dragStartX = 0;
  let didDrag = false;

  function onDragStart(e) {
    if (isAnimating || deck.length === 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging = true;
    dragStartX = e.clientX;
    dragX = 0;
    didDrag = false;
  }

  function onDragMove(e) {
    if (!isDragging) return;
    dragX = e.clientX - dragStartX;
    if (Math.abs(dragX) > 6) didDrag = true;
    swipeDir = dragX > 40 ? 'right' : dragX < -40 ? 'left' : null;
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    const THRESHOLD = 90;
    if      (dragX >  THRESHOLD) { dragX = 0; swipe('right'); }
    else if (dragX < -THRESHOLD) { dragX = 0; swipe('left');  }
    else { dragX = 0; swipeDir = null; }
  }

  function onLinkClick(e) {
    if (didDrag) { e.preventDefault(); didDrag = false; }
  }

  function restoreSkipped() {
    clearSkipped(activeType);
    skipPromptDismissed = false;
    deck = buildDeck(activeType);
  }

  function switchType(type) {
    if (type === activeType || isAnimating) return;
    activeType = type;
    skipPromptDismissed = false;
    deck = buildDeck(type);
    isAnimating = false;
    swipeDir = null;
    message = '';
  }

  function swipe(direction) {
    if (deck.length === 0 || isAnimating) return;

    const movie = deck[0];
    isAnimating = true;
    swipeDir = direction;

    setTimeout(() => {
      deck = deck.slice(1);
      isAnimating = false;
      swipeDir = null;

      if (direction === 'right') {
        favorites.update((list) => {
          if (list.some((item) => item.id === movie.id)) return list;
          return [movie, ...list];
        });
        fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movie, action: 'add' })
        });
        message = `"${movie.title}" zu Favoriten hinzugefügt.`;
      } else {
        addSkipped(activeType, movie.id);
        message = `"${movie.title}" verworfen.`;
      }
    }, 360);
  }
</script>

<svelte:window onkeydown={(e) => {
  if (e.key === 'ArrowLeft') swipe('left');
  if (e.key === 'ArrowRight') swipe('right');
}} />

<div class="page">
  <div class="shell">
    <div class="top-bar">
      <div class="type-toggle">
        <button class="toggle-btn" class:active={activeType === 'movie'} onclick={() => switchType('movie')}>
          🎬 Filme
        </button>
        <button class="toggle-btn" class:active={activeType === 'series'} onclick={() => switchType('series')}>
          📺 Serien
        </button>
      </div>

      <button class="recommend-toggle" class:active={recommendEnabled} onclick={toggleRecommend} title="Empfehlungen {recommendEnabled ? 'deaktivieren' : 'aktivieren'}">
        <span class="recommend-icon">✦</span>
        <span class="recommend-label">{recommendEnabled ? 'Empfehlungen an' : 'Empfehlungen aus'}</span>
        <span class="recommend-pill" class:on={recommendEnabled}>{recommendEnabled ? 'AN' : 'AUS'}</span>
      </button>
    </div>

    {#if deck.length > 0}
      <div class="deck" class:hint-left={swipeDir === 'left'} class:hint-right={swipeDir === 'right'}>
        {#each deck.slice(0, 3) as movie, index (movie.id)}
          <article
            class="card"
            class:exiting-left={index === 0 && !isDragging && swipeDir === 'left'}
            class:exiting-right={index === 0 && !isDragging && swipeDir === 'right'}
            style={index === 0
              ? isDragging
                ? `transform: translateX(${dragX}px) rotate(${dragX * 0.04}deg); z-index: 100; transition: none; cursor: grabbing;`
                : swipeDir
                  ? `z-index: 100;`
                  : `transform: translateY(${index * 14}px) scale(${1 - index * 0.045}); z-index: 100; transition: transform 0.28s ease; cursor: grab;`
              : `transform: translateY(${index * 14}px) scale(${1 - index * 0.045}); z-index: ${100 - index}; transition: transform 0.28s ease;`}
            onpointerdown={index === 0 ? onDragStart : undefined}
            onpointermove={index === 0 ? onDragMove  : undefined}
            onpointerup={index === 0 ? onDragEnd    : undefined}
            onpointercancel={index === 0 ? onDragEnd : undefined}
          >
            {#if index === 0 && swipeDir}
              <div class="swipe-badge" class:badge-like={swipeDir === 'right'} class:badge-nope={swipeDir === 'left'}>
                {swipeDir === 'right' ? 'LIKE' : 'NOPE'}
              </div>
            {/if}

            {#if index === 0 && movie.recommended && !swipeDir}
              <div class="recommended-badge">✦ Empfohlen für dich</div>
            {/if}

            <a class="card-inner" href={`/movie/${movie.id}`} onclick={onLinkClick}>
              <img src={movie.poster} alt={movie.title} />
              <div class="card-overlay">
                <div class="card-info">
                  <div class="genre-badge">{movie.genre} · {movie.year}</div>
                  <h2>{movie.title}</h2>
                  <p>{movie.description}</p>
                </div>
              </div>
            </a>
          </article>
        {/each}
      </div>

      <div class="actions">
        <button class="decline" onclick={() => swipe('left')} aria-label="Ablehnen" disabled={isAnimating}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button class="accept" onclick={() => swipe('right')} aria-label="Zu Favoriten hinzufügen" disabled={isAnimating}>
          🔥
        </button>
      </div>
    {:else}
      <div class="empty-state" in:fly={{ y: 20, duration: 300, easing: cubicOut }}>
        {#if skippedCount > 0 && !skipPromptDismissed}
          <!-- Prompt: übersprungene Filme eine zweite Chance geben -->
          <div class="skip-icon">↩︎</div>
          <h3>Alles gesehen!</h3>
          <p>
            Du hast <strong>{skippedCount} {activeType === 'series' ? (skippedCount === 1 ? 'Serie' : 'Serien') : (skippedCount === 1 ? 'Film' : 'Filme')}</strong>
            übersprungen. Willst du ihnen eine zweite Chance geben?
          </p>
          <div class="skip-actions">
            <button class="btn-yes" onclick={restoreSkipped}>Ja, nochmal anzeigen</button>
            <button class="btn-no" onclick={() => skipPromptDismissed = true}>Nein danke</button>
          </div>
        {:else}
          <!-- Normaler leerer Zustand -->
          <div class="skip-icon">🎉</div>
          <h3>Alles geswiped!</h3>
          {#if activeType === 'series'}
            <p>Du hast alle Serien gesehen.</p>
            <button class="cta-link" onclick={() => switchType('movie')}>Zu den Filmen wechseln</button>
          {:else}
            <p>Du hast alle Filme gesehen.</p>
            <button class="cta-link" onclick={() => switchType('series')}>Zu den Serien wechseln</button>
          {/if}
        {/if}
      </div>
    {/if}

    {#if message}
      <div class="toast" in:fly={{ y: 8, duration: 180 }}>{message}</div>
    {/if}
  </div>
</div>

<style>
  /* ── Top bar ── */

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  /* ── Type Toggle ── */

  .type-toggle {
    display: flex;
    gap: 0.4rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 999px;
    padding: 0.3rem;
    align-self: center;
    flex-shrink: 0;
  }

  /* ── Empfehlungs-Toggle ── */

  .recommend-toggle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.85rem 0.45rem 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: #8d8d92;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.22s ease;
    font-family: inherit;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .recommend-toggle:hover {
    background: rgba(255,255,255,0.09);
    color: #d8d8da;
  }

  .recommend-toggle.active {
    border-color: rgba(59,130,246,0.4);
    background: rgba(59,130,246,0.1);
    color: #93c5fd;
  }

  .recommend-icon {
    font-size: 0.85rem;
  }

  .recommend-label {
    display: none;
  }

  .recommend-pill {
    font-size: 0.68rem;
    font-weight: 800;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.1);
    color: #8d8d92;
    letter-spacing: 0.06em;
  }

  .recommend-pill.on {
    background: rgba(59,130,246,0.25);
    color: #93c5fd;
  }

  @media (min-width: 400px) {
    .recommend-label {
      display: inline;
    }
  }

  .toggle-btn {
    flex: 1;
    padding: 0.55rem 1.4rem;
    border: none;
    border-radius: 999px;
    background: none;
    color: #8d8d92;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.22s ease;
    font-family: inherit;
    white-space: nowrap;
  }

  .toggle-btn.active {
    background: #ff5a5f;
    color: white;
    box-shadow: 0 6px 20px rgba(255,90,95,0.35);
  }

  .toggle-btn:not(.active):hover {
    color: #f5f5f5;
    background: rgba(255,255,255,0.07);
  }

  .page {
    height: calc(100vh - 72px);
    padding: 1.25rem 1.5rem 1rem;
    background: #09090b;
    color: #f5f5f5;
    display: flex;
    flex-direction: column;
    overflow: visible;
  }

  .shell {
    flex: 1;
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
  }

  /* ── Deck ── */

  .deck {
    flex: 1;
    min-height: 0;
    position: relative;
    display: grid;
    place-items: center;
    border-radius: 28px;
    overflow: visible;
    transition: box-shadow 0.2s ease;
  }

  .deck.hint-right {
    box-shadow:
      0 0 0 3px rgba(34, 197, 94, 0.6),
      0 20px 60px rgba(0,0,0,0.4),
      0 0 100px rgba(34, 197, 94, 0.15);
  }

  .deck.hint-left {
    box-shadow:
      0 0 0 3px rgba(255, 90, 95, 0.6),
      0 20px 60px rgba(0,0,0,0.4),
      0 0 100px rgba(255, 90, 95, 0.15);
  }

  /* ── Card ── */

  .card {
    position: absolute;
    width: min(calc(100% - 2rem), 400px);
    border-radius: 24px;
    overflow: hidden;
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  @keyframes fly-left {
    from { transform: translateY(0) scale(1); opacity: 1; }
    to   { transform: translateX(-150vw) rotate(-28deg); opacity: 0; }
  }

  @keyframes fly-right {
    from { transform: translateY(0) scale(1); opacity: 1; }
    to   { transform: translateX(150vw) rotate(28deg); opacity: 0; }
  }

  .card.exiting-left {
    animation: fly-left 0.52s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    pointer-events: none;
    z-index: 9999 !important;
  }

  .card.exiting-right {
    animation: fly-right 0.52s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    pointer-events: none;
    z-index: 9999 !important;
  }

  /* ── Card inner (image + overlay) ── */

  .card-inner {
    display: block;
    position: relative;
    text-decoration: none;
    color: inherit;
  }

  .card-inner img {
    width: 100%;
    height: clamp(320px, 58vh, 520px);
    object-fit: cover;
    display: block;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 35%,
      rgba(0, 0, 0, 0.55) 60%,
      rgba(0, 0, 0, 0.92) 100%
    );
    display: flex;
    align-items: flex-end;
  }

  .card-info {
    padding: 1.5rem 1.4rem 1.4rem;
    display: grid;
    gap: 0.45rem;
    width: 100%;
  }

  .genre-badge {
    display: inline-block;
    width: fit-content;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.78rem;
    font-weight: 600;
    color: #e8e8ea;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .card-info h2 {
    margin: 0;
    font-size: clamp(1.4rem, 4vw, 2rem);
    font-weight: 700;
    line-height: 1.05;
    color: #fff;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  }

  .card-info p {
    margin: 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: 0.88rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
  }

  /* ── Empfohlen badge ── */

  .recommended-badge {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    padding: 0.35rem 1rem;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(147, 197, 253, 0.4);
    color: #fff;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    white-space: nowrap;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.5);
    pointer-events: none;
  }

  /* ── LIKE / NOPE badge ── */

  .swipe-badge {
    position: absolute;
    top: 1.25rem;
    padding: 0.35rem 1rem;
    border-radius: 6px;
    font-size: 1.4rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    border: 3px solid;
    z-index: 10;
    pointer-events: none;
    font-family: 'Space Grotesk', sans-serif;
  }

  .badge-like {
    left: 1.25rem;
    color: #22c55e;
    border-color: #22c55e;
    transform: rotate(-12deg);
  }

  .badge-nope {
    right: 1.25rem;
    color: #ff5a5f;
    border-color: #ff5a5f;
    transform: rotate(12deg);
  }

  /* ── Action buttons ── */

  .actions {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-shrink: 0;
    position: relative;
    z-index: 200;
  }

  .actions button {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: grid;
    place-items: center;
    font-size: 1.9rem;
    line-height: 1;
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease;
  }

  .actions button:disabled {
    cursor: default;
    opacity: 0.55;
  }

  .decline {
    background: rgba(255, 255, 255, 0.07);
    color: #ff5a5f;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.08);
    border: 1px solid rgba(255, 90, 95, 0.2) !important;
  }

  .decline:not(:disabled):hover {
    background: rgba(255, 90, 95, 0.14) !important;
    border-color: rgba(255, 90, 95, 0.45) !important;
    box-shadow: 0 16px 40px rgba(255, 90, 95, 0.3), 0 0 60px rgba(255,90,95,0.12) !important;
    transform: translateY(-6px) scale(1.12);
  }

  .accept {
    background: linear-gradient(135deg, #ff5a5f 0%, #ff3c88 100%);
    color: white;
    box-shadow:
      0 16px 40px rgba(255, 60, 136, 0.45),
      0 6px 16px rgba(255, 90, 95, 0.3),
      inset 0 1px 0 rgba(255,255,255,0.18);
    border: none !important;
  }

  .accept:not(:disabled):hover {
    background: linear-gradient(135deg, #ff6c72 0%, #ff4d9a 100%) !important;
    transform: translateY(-7px) scale(1.14);
    box-shadow:
      0 24px 56px rgba(255, 60, 136, 0.58),
      0 0 80px rgba(255, 90, 95, 0.22) !important;
  }

  /* ── Toast + empty ── */

  .toast {
    flex-shrink: 0;
    padding: 0.65rem 1rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.09);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #f5f5f5;
    text-align: center;
    font-size: 0.88rem;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 28px;
    color: #b4b4b7;
    background: rgba(255, 255, 255, 0.04);
    gap: 0.75rem;
    padding: 2rem;
  }

  .empty-state h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 800;
    color: #f5f5f5;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.95rem;
    color: #8d8d92;
    max-width: 28ch;
    line-height: 1.5;
  }

  .empty-state p strong {
    color: #d8d8da;
    font-weight: 700;
  }

  .skip-icon {
    font-size: 2.4rem;
    line-height: 1;
  }

  .skip-actions {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.25rem;
  }

  .btn-yes {
    padding: 0.75rem 1.4rem;
    background: #ff5a5f;
    color: #fff;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.92rem;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s, transform 0.15s;
    box-shadow: 0 10px 28px rgba(255, 90, 95, 0.3);
  }
  .btn-yes:hover { background: #ff6c72; transform: translateY(-2px); }

  .btn-no {
    padding: 0.75rem 1.4rem;
    background: rgba(255, 255, 255, 0.07);
    color: #8d8d92;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.92rem;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s, color 0.2s;
  }
  .btn-no:hover { background: rgba(255, 255, 255, 0.12); color: #d8d8da; }

  .cta-link {
    display: inline-block;
    padding: 0.8rem 1.4rem;
    background: rgba(255, 255, 255, 0.07);
    color: #d8d8da;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.92rem;
    transition: background 0.2s, color 0.2s;
  }
  .cta-link:hover { background: rgba(255, 255, 255, 0.13); color: #fff; }

  @media (max-width: 760px) {
    /* Account for bottom nav */
    .page { height: calc(100dvh - 56px - 72px); padding: 0.6rem 0.75rem 0.5rem; }
  }

  @media (max-width: 680px) {
    .page { padding: 0.6rem 0.6rem 0.5rem; }

    .card-inner img {
      height: clamp(280px, 55vh, 420px);
    }

    .actions button {
      width: 64px;
      height: 64px;
      font-size: 1.65rem;
    }
  }
</style>
