<script>
  import { enhance } from '$app/forms';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { data } = $props();

  const f = $derived(data.friendUser);
  const status = $derived(data.relationshipStatus);
  const areFriends = $derived(status === 'friends');

  let sharedFilter = $state('all');
  const sharedFiltered = $derived(
    sharedFilter === 'movie' ? data.sharedMovies :
    sharedFilter === 'series' ? data.sharedSeries :
    [...data.sharedMovies, ...data.sharedSeries]
  );

  function ini(name) {
    return name.split(/\s+/).map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
  }
</script>

<div class="page">
  <div class="shell">

    <!-- Back -->
    <a href="/friends" class="back-link">← Freunde</a>

    <!-- Profile Header -->
    <div class="profile-card" in:fly={{ y: 16, duration: 280, easing: cubicOut }}>
      <div class="phead">
        {#if f.avatar}
          <img src={f.avatar} alt={f.username} class="p-avatar" />
        {:else}
          <div class="p-avatar-init">{ini(f.username)}</div>
        {/if}
        <div class="p-info">
          <h1 class="p-name">{f.username}</h1>
          {#if areFriends}
            <div class="p-stats">
              <span class="p-stat"><strong>{f.likedMoviesCount}</strong> Filme</span>
              <span class="p-dot">·</span>
              <span class="p-stat"><strong>{f.likedSeriesCount}</strong> Serien</span>
            </div>
          {:else}
            <span class="p-muted">Profil wird nach Freundschaft sichtbar</span>
          {/if}
        </div>
      </div>

      <!-- Relationship controls -->
      <div class="rel-bar">
        {#if status === 'none'}
          <form method="POST" action="?/sendRequest" use:enhance>
            <button class="btn-primary" type="submit">+ Freundschaft anfragen</button>
          </form>

        {:else if status === 'pending_out'}
          <span class="chip muted">Anfrage gesendet…</span>
          <form method="POST" action="?/cancelRequest" use:enhance>
            <button class="btn-ghost-sm" type="submit">Abbrechen</button>
          </form>

        {:else if status === 'pending_in'}
          <span class="chip amber">Hat dir eine Anfrage geschickt</span>
          <form method="POST" action="?/acceptRequest" use:enhance>
            <input type="hidden" name="friendshipId" value={data.friendshipId} />
            <button class="btn-yes" type="submit">Akzeptieren</button>
          </form>
          <form method="POST" action="?/rejectRequest" use:enhance>
            <input type="hidden" name="friendshipId" value={data.friendshipId} />
            <button class="btn-no" type="submit">Ablehnen</button>
          </form>

        {:else if status === 'friends'}
          <span class="chip green">Befreundet ✓</span>
          <form method="POST" action="?/removeFriend" use:enhance>
            <input type="hidden" name="friendshipId" value={data.friendshipId} />
            <button class="btn-ghost-sm danger" type="submit">Entfreunden</button>
          </form>
        {/if}
      </div>
    </div>

    {#if areFriends}

      <!-- Shared Movies -->
      <div class="shared-card" in:fly={{ y: 16, duration: 280, delay: 60, easing: cubicOut }}>
        <div class="shared-head">
          <div class="shared-title-row">
            <span class="shared-icon">🎯</span>
            <h2 class="shared-title">Gemeinsame Favoriten</h2>
            <span class="ct">{data.sharedMovies.length + data.sharedSeries.length}</span>
          </div>
          {#if data.sharedMovies.length > 0 && data.sharedSeries.length > 0}
            <div class="filter-tabs">
              <button class="tab" class:active={sharedFilter === 'all'} onclick={() => sharedFilter = 'all'}>
                Alle <span class="tct">{data.sharedMovies.length + data.sharedSeries.length}</span>
              </button>
              <button class="tab" class:active={sharedFilter === 'movie'} onclick={() => sharedFilter = 'movie'}>
                Filme <span class="tct">{data.sharedMovies.length}</span>
              </button>
              <button class="tab" class:active={sharedFilter === 'series'} onclick={() => sharedFilter = 'series'}>
                Serien <span class="tct">{data.sharedSeries.length}</span>
              </button>
            </div>
          {/if}
        </div>

        {#if sharedFiltered.length === 0}
          <p class="shared-empty">Noch keine gemeinsamen Favoriten gefunden. Swipe mehr Filme!</p>
        {:else}
          <ul class="shared-grid">
            {#each sharedFiltered as movie, i (movie.id)}
              <li in:fly={{ y: 12, duration: 240, delay: i * 40, easing: cubicOut }}>
                <a href="/movie/{movie.id}" class="movie-tile">
                  {#if movie.poster}
                    <img src={movie.poster} alt={movie.title} class="tile-poster" />
                  {:else}
                    <div class="tile-poster no-poster">{movie.type === 'series' ? '📺' : '🎬'}</div>
                  {/if}
                  <div class="tile-info">
                    <span class="tile-title">{movie.title}</span>
                    <span class="tile-meta">{movie.year} · {movie.genre}</span>
                  </div>
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <!-- Their favorites -->
      {#if f.favoriteMovie || f.favoriteSeries}
        <div class="section-card" in:fly={{ y: 16, duration: 280, delay: 120, easing: cubicOut }}>
          <h2 class="sec-h">Lieblinge von {f.username}</h2>
          <div class="fav-pair">
            {#if f.favoriteMovie}
              <div class="fav-entry">
                <span class="fav-label">🎬 Lieblingsfilm</span>
                <a href="/movie/{f.favoriteMovie.id}" class="fav-item">
                  {#if f.favoriteMovie.poster}
                    <img src={f.favoriteMovie.poster} alt={f.favoriteMovie.title} class="fav-poster" />
                  {:else}
                    <div class="fav-poster no-poster">🎬</div>
                  {/if}
                  <div class="fav-meta">
                    <span class="fav-title">{f.favoriteMovie.title}</span>
                    <span class="fav-sub">{f.favoriteMovie.year} · {f.favoriteMovie.genre}</span>
                  </div>
                </a>
              </div>
            {/if}
            {#if f.favoriteSeries}
              <div class="fav-entry">
                <span class="fav-label">📺 Lieblingsserie</span>
                <a href="/movie/{f.favoriteSeries.id}" class="fav-item">
                  {#if f.favoriteSeries.poster}
                    <img src={f.favoriteSeries.poster} alt={f.favoriteSeries.title} class="fav-poster" />
                  {:else}
                    <div class="fav-poster no-poster">📺</div>
                  {/if}
                  <div class="fav-meta">
                    <span class="fav-title">{f.favoriteSeries.title}</span>
                    <span class="fav-sub">{f.favoriteSeries.year} · {f.favoriteSeries.genre}</span>
                  </div>
                </a>
              </div>
            {/if}
          </div>
        </div>
      {/if}

    {/if}

  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    padding: 2.5rem 1.5rem;
    background: #09090b;
    color: #f5f5f5;
  }

  .shell {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    color: #6d6d72;
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 600;
    transition: color 0.18s;
  }

  .back-link:hover { color: #f5f5f5; }

  /* ── Profile card ── */
  .profile-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), #111214;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 28px;
    padding: 1.75rem 2rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
    display: flex; flex-direction: column; gap: 1.25rem;
  }

  .phead { display: flex; align-items: center; gap: 1.25rem; }

  .p-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }

  .p-avatar-init {
    width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #ff5a5f, #d97706);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.8rem; font-weight: 700; color: white;
    box-shadow: 0 8px 24px rgba(255,90,95,0.35);
  }

  .p-info { display: flex; flex-direction: column; gap: 0.4rem; }

  h1.p-name { margin: 0; font-size: 1.8rem; font-weight: 700; line-height: 1; }

  .p-stats { display: flex; align-items: center; gap: 0.5rem; }
  .p-stat  { font-size: 0.88rem; color: #b4b4b7; }
  .p-stat strong { color: #f5f5f5; }
  .p-dot   { color: #4d4d52; }
  .p-muted { font-size: 0.82rem; color: #5d5d61; }

  /* ── Relationship bar ── */
  .rel-bar {
    display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
    padding-top: 0.25rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .btn-primary {
    padding: 0.65rem 1.35rem;
    background: #ff5a5f; color: white;
    border: none; border-radius: 999px;
    font-size: 0.9rem; font-weight: 700;
    cursor: pointer; font-family: inherit;
    transition: background 0.18s, transform 0.15s;
  }
  .btn-primary:hover { background: #ff6c72; transform: translateY(-1px); }

  .btn-yes, .btn-no {
    padding: 0.5rem 1rem; border: none; border-radius: 999px;
    font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: all 0.18s;
  }
  .btn-yes { background: #16a34a; color: white; }
  .btn-yes:hover { background: #15803d; }
  .btn-no  { background: rgba(255,255,255,0.08); color: #b4b4b7; }
  .btn-no:hover  { background: rgba(255,90,95,0.12); color: #ff8a8e; }

  .btn-ghost-sm {
    padding: 0.4rem 0.85rem;
    background: none; border: 1px solid rgba(255,255,255,0.14); color: #8d8d92;
    border-radius: 999px; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; font-family: inherit; transition: all 0.18s;
  }
  .btn-ghost-sm:hover { background: rgba(255,255,255,0.07); color: #f5f5f5; }
  .btn-ghost-sm.danger:hover { background: rgba(255,90,95,0.12); border-color: rgba(255,90,95,0.3); color: #ff8a8e; }

  .chip {
    padding: 0.35rem 0.85rem; border-radius: 999px;
    font-size: 0.82rem; font-weight: 700;
  }
  .chip.green  { background: rgba(34,197,94,0.12); color: #86efac; border: 1px solid rgba(34,197,94,0.25); }
  .chip.amber  { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
  .chip.muted  { background: rgba(255,255,255,0.06); color: #8d8d92; border: 1px solid rgba(255,255,255,0.12); }

  /* ── Shared card ── */
  .shared-card {
    background: linear-gradient(145deg, rgba(255,90,95,0.07), rgba(255,90,95,0.02)), #111214;
    border: 1px solid rgba(255,90,95,0.2);
    border-radius: 24px;
    padding: 1.5rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    display: flex; flex-direction: column; gap: 1rem;
  }

  .shared-head { display: flex; flex-direction: column; gap: 0.75rem; }

  .shared-title-row {
    display: flex; align-items: center; gap: 0.6rem;
  }

  .shared-icon { font-size: 1.2rem; }

  .shared-title {
    margin: 0; font-size: 1rem; font-weight: 700; color: #f5f5f5;
    text-transform: none; letter-spacing: 0;
  }

  .ct {
    background: rgba(255,90,95,0.15);
    color: #ff8a8e;
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .filter-tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; }

  .tab {
    display: flex; align-items: center; gap: 0.35rem;
    padding: 0.4rem 0.85rem; border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: #b4b4b7; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; transition: all 0.18s; font-family: inherit;
  }
  .tab:hover { background: rgba(255,255,255,0.1); color: #f5f5f5; }
  .tab.active { background: #ff5a5f; border-color: #ff5a5f; color: white; box-shadow: 0 4px 14px rgba(255,90,95,0.3); }

  .tct {
    background: rgba(255,255,255,0.2); border-radius: 999px;
    padding: 0.05rem 0.4rem; font-size: 0.72rem;
  }

  .shared-empty { margin: 0; color: #5d5d61; font-size: 0.9rem; padding: 0.5rem 0; }

  .shared-grid {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 0.45rem;
  }

  .movie-tile {
    display: flex; align-items: center; gap: 0.9rem;
    padding: 0.6rem 0.75rem; border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    text-decoration: none; color: #f5f5f5;
    transition: background 0.15s, border-color 0.15s;
  }
  .movie-tile:hover {
    background: rgba(255,90,95,0.07);
    border-color: rgba(255,90,95,0.2);
  }

  .tile-poster {
    width: 42px; height: 62px; border-radius: 8px;
    object-fit: cover; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }

  .tile-poster.no-poster {
    background: rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
  }

  .tile-info { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
  .tile-title { font-size: 0.95rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile-meta  { font-size: 0.78rem; color: #8d8d92; }

  /* ── Section cards ── */
  .section-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), #111214;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px; padding: 1.5rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    display: flex; flex-direction: column; gap: 1rem;
  }

  .sec-h {
    margin: 0; font-size: 0.82rem; font-weight: 700;
    color: #6d6d72; text-transform: uppercase; letter-spacing: 0.08em;
  }

  /* ── Favorites ── */
  .fav-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

  .fav-entry { display: flex; flex-direction: column; gap: 0.6rem; }

  .fav-label { font-size: 0.78rem; color: #8d8d92; font-weight: 600; }

  .fav-item {
    display: flex; align-items: flex-start; gap: 0.75rem;
    text-decoration: none; color: #f5f5f5;
    padding: 0.6rem; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    transition: background 0.15s;
  }
  .fav-item:hover { background: rgba(255,255,255,0.05); }

  .fav-poster {
    width: 48px; height: 70px; border-radius: 8px;
    object-fit: cover; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }
  .fav-poster.no-poster {
    background: rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  }

  .fav-meta { display: flex; flex-direction: column; gap: 0.25rem; padding-top: 0.15rem; }
  .fav-title { font-size: 0.9rem; font-weight: 600; line-height: 1.2; }
  .fav-sub   { font-size: 0.75rem; color: #8d8d92; }

  @media (max-width: 680px) {
    .page { padding: 1.25rem 0.85rem; }
    .profile-card { padding: 1.25rem; }
    h1.p-name { font-size: 1.5rem; }
    .fav-pair { grid-template-columns: 1fr; }
    .rel-bar { flex-wrap: wrap; }
  }
</style>
