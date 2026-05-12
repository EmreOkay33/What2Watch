<script>
  import { watchlist, watched } from '$lib/stores';

  function markWatched(movie) {
    watched.update((list) => {
      if (list.some((item) => item.id === movie.id)) return list;
      return [movie, ...list];
    });

    watchlist.update((list) => list.filter((item) => item.id !== movie.id));
  }

  function removeFromWatchlist(movie) {
    watchlist.update((list) => list.filter((item) => item.id !== movie.id));
  }
</script>

<section class="page">
  <div class="shell">
    <header class="top-bar">
      <div>
        <h1>Watchlist</h1>
        <p>Alle Filme, die du später ansehen möchtest.</p>
      </div>
    </header>

    {#if $watchlist.length === 0}
      <div class="empty-state">
        <p>Deine Watchlist ist noch leer. Swipe Filme nach rechts, um sie hier zu speichern.</p>
        <a href="/swipe" class="cta-link">Zum Swipe-Modus</a>
      </div>
    {:else}
      <ul class="movie-grid">
        {#each $watchlist as movie (movie.id)}
          <li class="movie-card">
            <a class="poster-link" href={`/movie/${movie.id}`}>
              <img src={movie.poster} alt={movie.title} />
            </a>
            <div class="movie-info">
              <div>
                <h2>{movie.title}</h2>
                <p class="meta">{movie.genre} · {movie.year}</p>
                <p class="description">{movie.description}</p>
              </div>
              <div class="buttons">
                <button class="watched" onclick={() => markWatched(movie)}>Gesehen ✔</button>
                <button class="remove" onclick={() => removeFromWatchlist(movie)}>Entfernen</button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}

    {#if $watched.length > 0}
      <div class="watched-shell">
        <h2>Watched</h2>
        <p>Filme, die du bereits als gesehen markiert hast.</p>
        <ul class="movie-grid">
          {#each $watched as movie (movie.id)}
            <li class="movie-card watched-card">
              <a class="poster-link" href={`/movie/${movie.id}`}>
                <img src={movie.poster} alt={movie.title} />
              </a>
              <div class="movie-info">
                <h2>{movie.title}</h2>
                <p class="meta">{movie.genre} · {movie.year}</p>
              </div>
            </li>
          {/each}
        </ul>
      </div>
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

  .shell {
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

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 900;
  }

  p {
    margin: 0.35rem 0 0;
    color: #b4b4b7;
  }

  .action-link,
  .cta-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.85rem 1.2rem;
    border-radius: 999px;
    background: #ff5a5f;
    color: white;
    text-decoration: none;
    font-weight: 700;
  }

  .movie-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 1rem;
  }

  .movie-card {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 1rem;
    padding: 1.2rem;
    border-radius: 24px;
    background: #111214;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .watched-card {
    opacity: 0.92;
  }

  .poster-link {
    display: block;
    border-radius: 18px;
    overflow: hidden;
    background: #1a1a1e;
  }

  .poster-link img {
    width: 140px;
    height: 210px;
    object-fit: cover;
    display: block;
  }

  .movie-info {
    display: grid;
    gap: 0.9rem;
  }

  .movie-info h2 {
    margin: 0;
    font-size: 1.35rem;
  }

  .meta {
    margin: 0.25rem 0 0;
    color: #a6a6a8;
    font-size: 0.95rem;
  }

  .description {
    margin: 0.75rem 0 0;
    color: #d8d8da;
    line-height: 1.5;
    font-size: 0.95rem;
  }

  .buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  button {
    padding: 0.8rem 1rem;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.95rem;
  }

  .watched {
    background: #1e7d5c;
    color: white;
  }

  .remove {
    background: rgba(255, 255, 255, 0.08);
    color: #f5f5f5;
  }

  .remove:hover,
  .watched:hover {
    opacity: 0.95;
  }

  .empty-state {
    padding: 2rem;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    text-align: center;
    color: #b4b4b7;
  }

  .watched-shell {
    display: grid;
    gap: 1rem;
  }

  .watched-shell h2 {
    margin: 0;
    font-size: 1.55rem;
    font-weight: 800;
  }

  .watched-shell p {
    margin: 0;
    color: #b4b4b7;
  }
</style>
