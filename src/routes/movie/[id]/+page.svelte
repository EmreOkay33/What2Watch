<script>
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { data } = $props();
  const movie = $derived(data.movie);
  const tmdb  = $derived(data.tmdb);
</script>

{#if movie}
  <div class="page">

    <!-- Backdrop -->
    {#if tmdb?.backdrop}
      <div class="backdrop" style="background-image: url('{tmdb.backdrop}')"></div>
    {/if}

    <div class="content" in:fly={{ y: 20, duration: 300, easing: cubicOut }}>

      <!-- Hero -->
      <div class="hero">
        <div class="poster-wrap">
          <img src={movie.poster} alt={movie.title} class="poster" />
        </div>

        <div class="meta">
          <div class="badges">
            <span class="badge type">{movie.type === 'series' ? 'Serie' : 'Film'}</span>
            <span class="badge genre">{movie.genre}</span>
            <span class="badge year">{movie.year}</span>
            {#if tmdb?.rating}
              <span class="badge rating">★ {tmdb.rating}</span>
            {/if}
          </div>

          <h1>{movie.title}</h1>

          {#if tmdb?.tagline}
            <p class="tagline">„{tmdb.tagline}"</p>
          {/if}

          <!-- Infoleiste -->
          <div class="info-row">
            {#if movie.type !== 'series' && tmdb?.runtime}
              <div class="info-chip">
                <span class="info-icon">⏱</span>
                <span>{tmdb.runtime} Min.</span>
              </div>
            {/if}
            {#if movie.type === 'series' && tmdb?.seasons}
              <div class="info-chip">
                <span class="info-icon">📺</span>
                <span>{tmdb.seasons} Staffel{tmdb.seasons !== 1 ? 'n' : ''}</span>
              </div>
            {/if}
            {#if movie.type === 'series' && tmdb?.episodes}
              <div class="info-chip">
                <span class="info-icon">🎬</span>
                <span>{tmdb.episodes} Folgen</span>
              </div>
            {/if}
            {#if movie.type === 'series' && tmdb?.episodeRuntime}
              <div class="info-chip">
                <span class="info-icon">⏱</span>
                <span>~{tmdb.episodeRuntime} Min. / Folge</span>
              </div>
            {/if}
          </div>

          <p class="description">{movie.description}</p>

          <!-- Streaming-Anbieter -->
          {#if tmdb?.streaming?.length}
            <div class="section">
              <h2>Wo ansehen</h2>
              <div class="providers">
                {#each tmdb.streaming as p}
                  <div class="provider" title={p.name}>
                    <img src={p.logo} alt={p.name} />
                    <span>{p.name}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <button onclick={() => history.back()} class="back-btn">← Zurück</button>
        </div>
      </div>

      <!-- Cast -->
      {#if tmdb?.cast?.length}
        <div class="cast-section" in:fly={{ y: 16, duration: 280, delay: 120, easing: cubicOut }}>
          <h2>Besetzung</h2>
          <div class="cast-grid">
            {#each tmdb.cast as actor}
              <div class="actor-card">
                {#if actor.photo}
                  <img src={actor.photo} alt={actor.name} class="actor-photo" />
                {:else}
                  <div class="actor-photo no-photo">👤</div>
                {/if}
                <div class="actor-info">
                  <span class="actor-name">{actor.name}</span>
                  <span class="actor-role">{actor.character}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

    </div>
  </div>

{:else}
  <div class="not-found">
    <h1>Nicht gefunden</h1>
    <p>Dieser Film existiert nicht in der Datenbank.</p>
    <a href="/" class="back-btn">← Zur Startseite</a>
  </div>
{/if}

<style>
  .page {
    min-height: 100vh;
    background: #09090b;
    color: #f5f5f5;
    position: relative;
    overflow: hidden;
  }

  .backdrop {
    position: fixed; inset: 0;
    background-size: cover; background-position: center top;
    filter: blur(36px) brightness(0.18) saturate(1.5);
    transform: scale(1.12);
    z-index: 0;
    pointer-events: none;
  }

  .content {
    position: relative; z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    padding: 3rem 1.5rem 4rem;
    display: flex; flex-direction: column; gap: 2.5rem;
  }

  /* ── Hero ── */
  .hero {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2.5rem;
    align-items: start;
  }

  .poster-wrap {
    border-radius: 20px; overflow: hidden;
    box-shadow:
      0 30px 80px rgba(0,0,0,0.65),
      0 0 0 1px rgba(255,255,255,0.07),
      0 0 80px rgba(255,90,95,0.18);
    flex-shrink: 0;
  }

  .poster { width: 100%; display: block; }

  .meta { display: flex; flex-direction: column; gap: 1rem; padding-top: 0.5rem; }

  .badges { display: flex; flex-wrap: wrap; gap: 0.4rem; }

  .badge {
    padding: 0.3rem 0.75rem; border-radius: 999px;
    font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .badge.type    { background: rgba(255,90,95,0.18); color: #ff8a8e; border: 1px solid rgba(255,90,95,0.3); }
  .badge.genre   { background: rgba(255,255,255,0.08); color: #d8d8da; border: 1px solid rgba(255,255,255,0.12); }
  .badge.year    { background: rgba(255,255,255,0.06); color: #b4b4b7; border: 1px solid rgba(255,255,255,0.1); }
  .badge.rating  { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3.6rem);
    font-weight: 900; line-height: 1;
  }

  .tagline { margin: 0; color: #8d8d92; font-style: italic; font-size: 1rem; }

  .info-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }

  .info-chip {
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.4rem 0.85rem; border-radius: 999px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 0.85rem; color: #d8d8da; font-weight: 600;
  }

  .description {
    margin: 0; color: #c8c8ca; font-size: 1rem; line-height: 1.7;
    max-width: 62ch;
  }

  /* ── Streaming ── */
  .section h2, .cast-section h2 {
    margin: 0 0 1rem;
    font-size: 0.82rem; font-weight: 700; color: #8d8d92;
    text-transform: uppercase; letter-spacing: 0.08em;
  }

  .providers { display: flex; flex-wrap: wrap; gap: 0.75rem; }

  .provider {
    display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
    font-size: 0.72rem; color: #8d8d92; font-weight: 600; text-align: center;
    max-width: 60px;
  }

  .provider img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; }

  /* ── Cast ── */
  .cast-section {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px; padding: 1.5rem;
  }

  .cast-grid { display: flex; gap: 1rem; flex-wrap: wrap; }

  .actor-card {
    display: flex; align-items: center; gap: 0.75rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 0.6rem 0.9rem;
    min-width: 180px; flex: 1;
  }

  .actor-photo {
    width: 48px; height: 48px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
  }

  .no-photo {
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; flex-shrink: 0;
  }

  .actor-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
  .actor-name { font-size: 0.88rem; font-weight: 700; color: #f5f5f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .actor-role { font-size: 0.75rem; color: #8d8d92; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .back-btn {
    display: inline-flex; align-items: center;
    padding: 0.7rem 1.2rem; border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.14);
    color: #d8d8da; text-decoration: none;
    font-size: 0.88rem; font-weight: 600;
    transition: all 0.18s; width: fit-content;
    margin-top: 0.5rem;
  }
  .back-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

  /* ── Not found ── */
  .not-found {
    max-width: 500px; margin: 8rem auto; text-align: center;
    padding: 3rem; background: #111214;
    border: 1px solid rgba(255,255,255,0.1); border-radius: 28px;
  }

  @media (max-width: 700px) {
    .hero { grid-template-columns: 1fr; }
    .poster-wrap { max-width: 220px; }
    .cast-grid { flex-direction: column; }
    .actor-card { min-width: unset; }
  }
</style>
