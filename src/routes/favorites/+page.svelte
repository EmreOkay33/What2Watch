<script>
  import { favorites, watchlist } from '$lib/stores';

  function addToWatchlist(movie) {
    watchlist.update((list) => {
      if (list.some((item) => item.id === movie.id)) return list;
      return [movie, ...list];
    });
  }

  function removeFavorite(movie) {
    favorites.update((list) => list.filter((item) => item.id !== movie.id));
  }
</script>

<section class="page">
  <div class="shell">
    <header class="top-bar">
      <h1>Favoriten-Liste</h1>
      <a href="/add" class="add-link">+ Film hinzufügen</a>
      <a href="/swipe" class="swipe-link">Swipen</a>
    </header>

    {#if $favorites.length === 0}
      <div class="empty">
        <p>Du hast noch keine Filme als Favorit markiert. Swipe einige Filme nach rechts, um sie hier zu speichern.</p>
        <a href="/swipe" class="cta-link">Zurück zum Swipe</a>
      </div>
    {:else}
      <ul class="movie-grid">
        {#each $favorites as movie (movie.id)}
          <li>
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

  .top-bar h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
  }

  .add-link,
  .swipe-link {
    padding: 0.75rem 1.1rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    color: #f5f5f5;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .add-link:hover,
  .swipe-link:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .movie-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 1rem;
  }

  .card {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 1.2rem;
    padding: 1.2rem;
    border-radius: 24px;
    background: #111214;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.2s ease;
  }

  .card:hover {
    border-color: rgba(255, 255, 255, 0.16);
  }

  .poster-cont {
    display: block;
    border-radius: 16px;
    overflow: hidden;
    background: #1a1a1e;
  }

  .poster-cont img {
    width: 140px;
    height: 200px;
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
    font-size: 1.4rem;
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
    padding: 0.7rem 1rem;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .to-watch {
    background: #ff5a5f;
    color: white;
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
    padding: 2.5rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.03);
    color: #b4b4b7;
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
</style>
