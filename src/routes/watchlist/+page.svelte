<script>
  import { watchlist, watched } from '$lib/stores';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  function markWatched(movie) {
    watched.update((list) => {
      if (list.some((item) => item.id === movie.id)) return list;
      return [movie, ...list];
    });
    watchlist.update((list) => list.filter((item) => item.id !== movie.id));
    fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ movie, action: 'watched' }) });
  }

  function removeFromWatchlist(movie) {
    watchlist.update((list) => list.filter((item) => item.id !== movie.id));
    fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ movie, action: 'remove' }) });
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
        {#each $watchlist as movie, i (movie.id)}
          <li class="movie-card" in:fly={{ y: 24, duration: 300, delay: i * 55, easing: cubicOut }} out:fade={{ duration: 180 }}>
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
          {#each $watched as movie, i (movie.id)}
            <li class="movie-card watched-card" in:fly={{ y: 20, duration: 280, delay: i * 45, easing: cubicOut }}>
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

  h1 {
    margin: 0;
    font-size: clamp(2.4rem, 6vw, 4.8rem);
    font-weight: 900;
    line-height: 0.98;
    background: linear-gradient(135deg, #ffffff 30%, #c4b5fd 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    margin: 0.35rem 0 0;
    color: #b4b4b7;
  }

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
    gap: 0.85rem;
  }

  .movie-card {
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
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.22s ease, box-shadow 0.22s ease;
  }

  .movie-card:hover {
    border-color: rgba(255, 255, 255, 0.22);
    transform: translateY(-4px);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.38);
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
    width: 150px;
    height: 218px;
    object-fit: cover;
    display: block;
  }

  .movie-info {
    display: grid;
    gap: 0.9rem;
  }

  .movie-info h2 {
    margin: 0;
    font-size: 1.55rem;
    line-height: 1.1;
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
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
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
    padding: 3rem 2rem;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    color: #b4b4b7;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25);
  }

  .watched-shell {
    display: grid;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .watched-shell h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
  }

  .watched-shell p {
    margin: 0;
    color: #b4b4b7;
  }

  @media (max-width: 680px) {
    .page {
      padding: 1.25rem 0.85rem;
    }

    h1 {
      font-size: clamp(1.8rem, 8vw, 2.6rem);
    }

    .movie-card {
      grid-template-columns: 90px 1fr;
      gap: 0.8rem;
      border-radius: 18px;
    }

    .poster-link img {
      width: 90px;
      height: 135px;
    }

    .movie-info h2 {
      font-size: 1.05rem;
    }

    .meta { font-size: 0.82rem; }

    .description {
      font-size: 0.85rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    button {
      font-size: 0.82rem;
      padding: 0.6rem 0.85rem;
    }

    .watched-shell h2 {
      font-size: 1.5rem;
    }
  }
</style>
