<script>
  import { sampleMovies } from '$lib/movies';
  import { favorites, customMovies } from '$lib/stores';

  let search = $state('');
  let deck = $state([]);
  let message = $state('');

  $effect(() => {
    const allMovies = [...$customMovies, ...sampleMovies];
    deck = allMovies.filter((movie) => movie.title.toLowerCase().includes(search.toLowerCase()));
  });

  function swipe(direction) {
    if (deck.length === 0) {
      message = 'Keine Filme mehr zum Swipen.';
      return;
    }

    const movie = deck[0];
    deck = deck.slice(1);

    if (direction === 'right') {
      favorites.update((list) => {
        if (list.some((item) => item.id === movie.id)) return list;
        return [movie, ...list];
      });
      message = `"${movie.title}" wurde zu deinen Favoriten hinzugefügt.`;
    } else {
      message = `"${movie.title}" wurde verworfen.`;
    }
  }
</script>

<section class="page">
  <div class="swipe-shell">
    <header class="top-bar">
      <div class="title-block">
        <span class="brand">What2Watch</span>
        <span class="mode">Swipe-Mode</span>
      </div>
      <nav class="quick-nav">
        <a href="/favorites">Favoriten</a>
        <a href="/watchlist">Watchlist</a>
      </nav>
    </header>

    <div class="search-block">
      <input
        type="search"
        placeholder="Suche nach Titel..."
        bind:value={search}
      />
    </div>

    {#if deck.length > 0}
      <div class="deck">
        {#each deck.slice(0, 3) as movie, index (movie.id)}
          <article
            class="card"
            style="transform: translateY({index * 12}px) scale({1 - index * 0.04}); z-index: {100 - index};"
          >
            <a class="poster-link" href={`/movie/${movie.id}`}>
              <img src={movie.poster} alt={movie.title} />
            </a>
            <div class="card-meta">
              <div class="meta-header">
                <h2>{movie.title}</h2>
                <span>{movie.genre} · {movie.year}</span>
              </div>
              <p>{movie.description}</p>
            </div>
          </article>
        {/each}
      </div>

      <div class="actions">
        <button class="decline" onclick={() => swipe('left')}>✘</button>
        <button class="accept" onclick={() => swipe('right')}>🔥</button>
      </div>
    {:else}
      <div class="empty-state">
        <p>Keine Filme zum Swipen gefunden. Ändere die Suche oder füge einen eigenen Film hinzu.</p>
      </div>
    {/if}

    {#if message}
      <div class="toast">{message}</div>
    {/if}
  </div>
</section>

<style>
  .page {
    min-height: 100vh;
    padding: 1.5rem;
    background: #09090b;
    color: #f5f5f5;
  }

  .swipe-shell {
    max-width: 960px;
    margin: 0 auto;
    display: grid;
    gap: 1.5rem;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .title-block {
    display: grid;
    gap: 0.35rem;
  }

  .brand {
    font-size: 1.9rem;
    font-weight: 900;
    letter-spacing: 0.06em;
  }

  .mode {
    color: #a6a6a8;
    font-size: 0.95rem;
  }

  .quick-nav {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .quick-nav a {
    padding: 0.75rem 1.1rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    color: #f5f5f5;
    text-decoration: none;
    font-weight: 600;
  }

  .quick-nav a:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .search-block input {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.05);
    color: #f5f5f5;
    padding: 0.95rem 1rem;
    border-radius: 999px;
    outline: none;
  }

  .search-block input::placeholder {
    color: #8d8d92;
  }

  .deck {
    position: relative;
    min-height: 620px;
    display: grid;
    place-items: center;
  }

  .card {
    position: absolute;
    width: min(100%, 420px);
    border-radius: 24px;
    background: #111214;
    overflow: hidden;
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.45);
    transition: transform 0.2s ease;
  }

  .poster-link {
    display: block;
  }

  .card img {
    width: 100%;
    height: 520px;
    object-fit: cover;
    display: block;
  }

  .card-meta {
    padding: 1.2rem;
    display: grid;
    gap: 0.85rem;
  }

  .meta-header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .meta-header h2 {
    margin: 0;
    font-size: 1.6rem;
  }

  .meta-header span {
    color: #a6a6a8;
    font-size: 0.95rem;
  }

  .card-meta p {
    margin: 0;
    color: #d8d8da;
    line-height: 1.55;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 1.25rem;
    margin-top: 1rem;
  }

  .actions button {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    font-size: 2rem;
    display: grid;
    place-items: center;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
    transition: transform 0.2s ease;
  }

  .actions button:hover {
    transform: translateY(-3px);
  }

  .decline {
    background: #161616;
    color: #ff5a5f;
  }

  .accept {
    background: #ff5a5f;
    color: white;
  }

  .toast {
    max-width: 520px;
    margin: 0 auto;
    padding: 0.9rem 1.2rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: #f5f5f5;
    text-align: center;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    color: #b4b4b7;
    background: rgba(255, 255, 255, 0.03);
  }
</style>
