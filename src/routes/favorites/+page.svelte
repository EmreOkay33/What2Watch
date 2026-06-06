<script>
  import { favorites, watchlist } from '$lib/stores';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let toast = $state('');
  let toastTimer = null;
  let activeFilter = $state('all');
  let activeGenre  = $state('all');

  const genres = $derived(
    ['all', ...new Set($favorites.map(f => f.genre).filter(Boolean).sort())]
  );

  const filtered = $derived(
    $favorites
      .filter(f => activeFilter === 'all' || (activeFilter === 'movie' ? (!f.type || f.type === 'movie') : f.type === 'series'))
      .filter(f => activeGenre === 'all' || f.genre === activeGenre)
  );

  function addToWatchlist(movie) {
    const alreadyIn = $watchlist.some((item) => item.id === movie.id);
    if (!alreadyIn) {
      watchlist.update((list) => [movie, ...list]);
      fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ movie, action: 'add' }) });
    }
    clearTimeout(toastTimer);
    toast = alreadyIn
      ? `"${movie.title}" ist bereits in deiner Watchlist.`
      : `"${movie.title}" wurde zur Watchlist hinzugefügt. ✓`;
    toastTimer = setTimeout(() => (toast = ''), 3000);
  }

  function removeFavorite(movie) {
    favorites.update((list) => list.filter((item) => item.id !== movie.id));
    fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ movie, action: 'remove' }) });
  }
</script>

<section class="page">
  <div class="shell">
    <header class="top-bar">
      <h1>Favoriten-Liste</h1>
      <div class="filter-tabs">
        <button class="tab" class:active={activeFilter === 'all'} onclick={() => activeFilter = 'all'}>
          Alle <span class="count">{$favorites.length}</span>
        </button>
        <button class="tab" class:active={activeFilter === 'movie'} onclick={() => activeFilter = 'movie'}>
          Filme <span class="count">{$favorites.filter(f => !f.type || f.type === 'movie').length}</span>
        </button>
        <button class="tab" class:active={activeFilter === 'series'} onclick={() => activeFilter = 'series'}>
          Serien <span class="count">{$favorites.filter(f => f.type === 'series').length}</span>
        </button>
      </div>
    </header>

    {#if genres.length > 1}
      <div class="genre-bar">
        {#each genres as genre}
          <button
            class="genre-chip"
            class:active={activeGenre === genre}
            onclick={() => activeGenre = genre}
          >
            {genre === 'all' ? 'Alle Genres' : genre}
          </button>
        {/each}
      </div>
    {/if}

    {#if $favorites.length === 0}
      <div class="empty">
        <p>Du hast noch keine Filme als Favorit markiert. Swipe einige Filme nach rechts, um sie hier zu speichern.</p>
        <a href="/swipe" class="cta-link">Zurück zum Swipe</a>
      </div>
    {:else if filtered.length === 0}
      <div class="empty">
        <p>Keine Einträge für diesen Filter gefunden.</p>
        <button class="cta-link" onclick={() => { activeFilter = 'all'; activeGenre = 'all'; }}>Filter zurücksetzen</button>
      </div>
    {:else}
      <ul class="movie-grid">
        {#each filtered as movie, i (movie.id)}
          <li in:fly={{ y: 24, duration: 300, delay: i * 55, easing: cubicOut }} out:fade={{ duration: 180 }}>
            <div class="card">
              <a href={`/movie/${movie.id}`} class="poster-cont">
                <img src={movie.poster} alt={movie.title} />
              </a>
              <div class="info">
                <div class="title-block">
                  <h3>{movie.title}</h3>
                  <span class="meta">{movie.genre} · {movie.year}</span>
                </div>
                <p class="desc">{movie.description}</p>
                <div class="actions">
                  <button class="to-watch" onclick={() => addToWatchlist(movie)}>To Watch →</button>
                  <button class="remove" onclick={() => removeFavorite(movie)}>Entfernen</button>
                </div>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  {#if toast}
    <div class="toast" in:fly={{ y: 16, duration: 220 }} out:fade={{ duration: 180 }}>
      {toast}
    </div>
  {/if}
</section>

<style>
  .page {
    min-height: 100vh;
    padding: 3rem 1.5rem;
    background: #09090b;
    color: #f5f5f5;
  }

  .shell {
    max-width: 1120px;
    margin: 0 auto;
    display: grid;
    gap: 1.35rem;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .top-bar h1 {
    margin: 0;
    font-size: clamp(2.4rem, 6vw, 4.8rem);
    font-weight: 900;
    line-height: 0.98;
    background: linear-gradient(135deg, #ffffff 30%, #ffb3c6 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .filter-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: #b4b4b7;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
    font-family: inherit;
  }

  .tab:hover { background: rgba(255,255,255,0.1); color: #f5f5f5; }

  .tab.active {
    background: #ff5a5f;
    border-color: #ff5a5f;
    color: white;
    box-shadow: 0 6px 20px rgba(255,90,95,0.3);
  }

  .count {
    background: rgba(255,255,255,0.2);
    border-radius: 999px;
    padding: 0.05rem 0.45rem;
    font-size: 0.78rem;
  }

  .tab.active .count { background: rgba(255,255,255,0.25); }

  .genre-bar {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    padding: 0.25rem 0;
  }

  .genre-chip {
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #b4b4b7;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }

  .genre-chip:hover { background: rgba(255,255,255,0.09); color: #f5f5f5; }

  .genre-chip.active {
    background: rgba(255,90,95,0.15);
    border-color: rgba(255,90,95,0.45);
    color: #ff8a8e;
  }

  .movie-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.85rem;
  }

  .card {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 1.2rem;
    padding: 1rem;
    border-radius: 24px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
      #111214;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
    transition: border-color 0.2s ease, transform 0.22s ease, box-shadow 0.22s ease;
    cursor: pointer;
  }

  .card:hover {
    border-color: rgba(255, 255, 255, 0.22);
    transform: translateY(-4px);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.38);
  }

  .poster-cont {
    display: block;
    border-radius: 18px;
    overflow: hidden;
    background: #1a1a1e;
  }

  .poster-cont img {
    width: 150px;
    height: 218px;
    object-fit: cover;
    display: block;
  }

  .info {
    display: grid;
    gap: 0.8rem;
  }

  .title-block {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .title-block h3 {
    margin: 0;
    font-size: 1.55rem;
    line-height: 1.1;
  }

  .meta {
    color: #a6a6a8;
    font-size: 0.95rem;
  }

  .desc {
    margin: 0;
    color: #d8d8da;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
    margin-top: 0.3rem;
  }

  .to-watch,
  .remove {
    padding: 0.72rem 1rem;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .to-watch {
    background: #ff5a5f;
    color: white;
    box-shadow: 0 14px 28px rgba(255, 90, 95, 0.2);
  }

  .to-watch:hover {
    background: #ff6c72;
  }

  .remove {
    background: rgba(255, 255, 255, 0.08);
    color: #f5f5f5;
  }

  .remove:hover {
    background: rgba(255, 255, 255, 0.16);
  }

  .empty {
    padding: 3rem 2rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.04);
    color: #b4b4b7;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25);
  }

  .cta-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.85rem 1.4rem;
    background: #ff5a5f;
    color: white;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 600;
  }

  @media (max-width: 680px) {
    .page {
      padding: 1.25rem 0.85rem;
    }

    .top-bar {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .top-bar h1 {
      font-size: clamp(1.8rem, 8vw, 2.6rem);
    }

    .filter-tabs {
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 0.25rem;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .filter-tabs::-webkit-scrollbar { display: none; }

    .tab {
      white-space: nowrap;
      flex-shrink: 0;
      font-size: 0.82rem;
      padding: 0.45rem 0.85rem;
    }

    .genre-bar {
      overflow-x: auto;
      flex-wrap: nowrap;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .genre-bar::-webkit-scrollbar { display: none; }

    .genre-chip { white-space: nowrap; flex-shrink: 0; }

    .card {
      grid-template-columns: 90px 1fr;
      gap: 0.8rem;
      border-radius: 18px;
    }

    .poster-cont img {
      width: 90px;
      height: 135px;
    }

    .title-block h3 {
      font-size: 1.05rem;
    }

    .meta { font-size: 0.82rem; }

    .desc {
      font-size: 0.85rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .to-watch, .remove {
      font-size: 0.82rem;
      padding: 0.6rem 0.85rem;
    }
  }

  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.85rem 1.5rem;
    border-radius: 999px;
    background: #1a1a1e;
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #f5f5f5;
    font-size: 0.92rem;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  @media (max-width: 680px) {
    .toast {
      bottom: calc(72px + env(safe-area-inset-bottom, 0px) + 0.75rem);
      font-size: 0.82rem;
      padding: 0.65rem 1.1rem;
      max-width: calc(100vw - 2rem);
      white-space: normal;
      text-align: center;
    }
  }
</style>
