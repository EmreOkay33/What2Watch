<script>
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { data, form } = $props();

  const initials = $derived(
    (data.user.username ?? '?').split(' ').map(w => w[0] ?? '').filter(Boolean).join('').toUpperCase().slice(0, 2) || '?'
  );

  // Gelikte Filme/Serien + Watchlist-Anzahl aus localStorage
  let favMovies = $state([]);
  let favSeries = $state([]);
  let watchlistCount = $state(0);
  onMount(() => {
    try {
      const favSaved = localStorage.getItem('what2watch-favorites');
      const favList = favSaved ? JSON.parse(favSaved) : [];
      favMovies = favList.filter(f => !f.type || f.type === 'movie');
      favSeries = favList.filter(f => f.type === 'series');

      const wlSaved = localStorage.getItem('what2watch-watchlist');
      watchlistCount = wlSaved ? JSON.parse(wlSaved).length : 0;
    } catch {}
  });

  // Picker-Zustand – data.favoriteMovie/favoriteSeries wird direkt genutzt
  // SvelteKit aktualisiert data nach Form-Actions automatisch
  let pickingMovie    = $state(false);
  let selectedMovieId = $state('');
  const selectedMovie = $derived(favMovies.find(m => m.id === selectedMovieId) ?? null);

  let pickingSeries    = $state(false);
  let selectedSeriesId = $state('');
  const selectedSerie  = $derived(favSeries.find(s => s.id === selectedSeriesId) ?? null);

  let saving = $state(false);
</script>

<div class="page">

  <!-- Header -->
  <div class="profile-header" in:fly={{ y: 16, duration: 280, easing: cubicOut }}>

    <!-- Avatar mit Upload -->
    <div class="avatar-wrap">
      <form method="POST" action="?/uploadAvatar" enctype="multipart/form-data" use:enhance={() => {
        return async ({ update }) => { await update(); };
      }}>
        <label class="avatar-label" title="Profilbild ändern">
          {#if data.avatar}
            <img src={data.avatar} alt="Profilbild" class="avatar-img" />
          {:else}
            <div class="avatar">{initials}</div>
          {/if}
          <div class="avatar-overlay">Ändern</div>
          <input type="file" name="avatar" accept="image/*" class="avatar-input"
            onchange={(e) => e.currentTarget.form.requestSubmit()} />
        </label>
      </form>
      {#if data.avatar}
        <form method="POST" action="?/removeAvatar" use:enhance={() => {
          return async ({ update }) => { await update(); };
        }}>
          <button type="submit" class="avatar-remove" title="Bild entfernen">✕</button>
        </form>
      {/if}
    </div>

    <div class="header-info">
      <h1>{data.user.username}</h1>
      <span class="email">{data.user.email}</span>
      {#if data.user.role === 'admin'}
        <span class="role-badge admin">Admin</span>
      {:else}
        <span class="role-badge user">User</span>
      {/if}
      {#if form?.avatarError}
        <span class="avatar-error">{form.avatarError}</span>
      {/if}
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-grid" in:fly={{ y: 16, duration: 280, delay: 40, easing: cubicOut }}>
    <div class="stat-card">
      <span class="stat-num">{favMovies.length}</span>
      <span class="stat-label">Gelikte Filme</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">{favSeries.length}</span>
      <span class="stat-label">Gelikte Serien</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">{watchlistCount}</span>
      <span class="stat-label">Watchlist</span>
    </div>
  </div>

  <!-- Toast feedback -->
  {#if form?.saved}
    <div class="alert success" in:fly={{ y: -6, duration: 200 }}>
      {form.savedType === 'series' ? 'Lieblingsserie gespeichert!' : 'Lieblingsfilm gespeichert!'}
    </div>
  {/if}
  {#if form?.removed}
    <div class="alert success" in:fly={{ y: -6, duration: 200 }}>Entfernt.</div>
  {/if}

  <!-- Lieblingsfilm -->
  <div class="section" in:fly={{ y: 16, duration: 280, delay: 80, easing: cubicOut }}>
    {@render FavPicker({
      label: "Lieblingsfilm",
      current: data.favoriteMovie,
      picking: pickingMovie,
      list: favMovies,
      selectedId: selectedMovieId,
      itemType: "movie",
      emptyHint: "Noch keine Filme geliked. Swipe Filme nach rechts!",
      onStartPick: () => { pickingMovie = true; selectedMovieId = data.favoriteMovie?.id ?? ''; },
      onCancel: () => { pickingMovie = false; },
      onSelectId: (id) => { selectedMovieId = id; },
      saving,
      onSaving: (v) => { saving = v; },
      selectedItem: selectedMovie,
      onSaved: () => { pickingMovie = false; }
    })}
  </div>

  <!-- Lieblingsserie -->
  <div class="section" in:fly={{ y: 16, duration: 280, delay: 120, easing: cubicOut }}>
    {@render FavPicker({
      label: "Lieblingsserie",
      current: data.favoriteSeries,
      picking: pickingSeries,
      list: favSeries,
      selectedId: selectedSeriesId,
      itemType: "series",
      emptyHint: "Noch keine Serien geliked. Swipe Serien nach rechts!",
      onStartPick: () => { pickingSeries = true; selectedSeriesId = data.favoriteSeries?.id ?? ''; },
      onCancel: () => { pickingSeries = false; },
      onSelectId: (id) => { selectedSeriesId = id; },
      saving,
      onSaving: (v) => { saving = v; },
      selectedItem: selectedSerie,
      onSaved: () => { pickingSeries = false; }
    })}
  </div>

  <!-- Account -->
  <div class="info-card" in:fly={{ y: 16, duration: 280, delay: 160, easing: cubicOut }}>
    <h2>Account-Details</h2>
    <div class="info-rows">
      <div class="info-row">
        <span class="info-label">Benutzername</span>
        <span class="info-value">{data.user.username}</span>
      </div>
      <div class="info-row">
        <span class="info-label">E-Mail</span>
        <span class="info-value">{data.user.email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Rolle</span>
        <span class="info-value capitalize">{data.user.role}</span>
      </div>
    </div>
  </div>

  {#if data.user.role === 'admin'}
    <div class="admin-card" in:fly={{ y: 16, duration: 280, delay: 200, easing: cubicOut }}>
      <div class="admin-icon">⚙️</div>
      <div>
        <strong>Admin-Zugang aktiv</strong>
        <p>Du kannst Filme & Serien verwalten und Benutzerkonten kontrollieren.</p>
      </div>
      <a href="/admin" class="admin-link">Admin Panel öffnen</a>
    </div>
  {/if}
</div>

<!-- ── Wiederverwendbare Picker-Komponente ── -->
{#snippet FavPicker({ label, current, picking, list, selectedId, itemType, emptyHint, onStartPick, onCancel, onSelectId, saving, onSaving, selectedItem, onSaved })}
  <div class="section-head">
    <h2>{label}</h2>
    {#if current && !picking}
      <button class="btn-ghost" onclick={onStartPick}>Ändern</button>
    {/if}
  </div>

  {#if current && !picking}
    <div class="fav-item">
      {#if current.poster}
        <img src={current.poster} alt={current.title} class="fav-poster" />
      {:else}
        <div class="fav-poster no-poster">{itemType === 'series' ? '📺' : '🎬'}</div>
      {/if}
      <div class="fav-info">
        <div class="fav-genre">{current.genre} · {current.year}</div>
        <div class="fav-title">{current.title}</div>
        <form method="POST" action="?/removeFavorite" use:enhance={() => {
          onSaving(true);
          return async ({ update }) => { onSaving(false); await update(); };
        }}>
          <input type="hidden" name="itemType" value={itemType} />
          <button type="submit" class="btn-remove" disabled={saving}>Entfernen</button>
        </form>
      </div>
    </div>

  {:else if list.length === 0}
    <p class="empty-hint">{emptyHint}</p>

  {:else}
    <div class="picker">
      <p class="picker-hint">Wähle aus deinen {list.length} gelikten {itemType === 'series' ? 'Serien' : 'Filmen'}:</p>
      <div class="movie-list">
        {#each list as item}
          <button type="button" class="movie-option" class:selected={selectedId === item.id} onclick={() => onSelectId(item.id)}>
            {#if item.poster}
              <img src={item.poster} alt={item.title} />
            {:else}
              <div class="no-thumb">{itemType === 'series' ? '📺' : '🎬'}</div>
            {/if}
            <div class="movie-option-info">
              <span class="movie-option-title">{item.title}</span>
              <span class="movie-option-meta">{item.year} · {item.genre}</span>
            </div>
            {#if selectedId === item.id}<span class="check">✓</span>{/if}
          </button>
        {/each}
      </div>
      <div class="picker-actions">
        <form method="POST" action="?/saveFavorite" use:enhance={() => {
          onSaving(true);
          return async ({ update }) => { onSaving(false); await update(); onSaved?.(); };
        }}>
          <input type="hidden" name="itemType" value={itemType} />
          <input type="hidden" name="movie" value={selectedItem ? JSON.stringify(selectedItem) : ''} />
          <button type="submit" class="btn-primary" disabled={!selectedItem || saving}>
            {saving ? 'Speichern…' : `Als ${itemType === 'series' ? 'Lieblingsserie' : 'Lieblingsfilm'} speichern`}
          </button>
        </form>
        {#if current}
          <button type="button" class="btn-ghost" onclick={onCancel}>Abbrechen</button>
        {/if}
      </div>
    </div>
  {/if}

  {#if !current && !picking && list.length > 0}
    <button class="btn-add-fav" onclick={onStartPick}>
      + {itemType === 'series' ? 'Lieblingsserie' : 'Lieblingsfilm'} auswählen
    </button>
  {/if}
{/snippet}

<style>
  .page {
    max-width: 680px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* ── Header ── */
  .profile-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.75rem 2rem;
    background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), #111214;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 28px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  }

  .avatar-wrap { position: relative; flex-shrink: 0; }

  .avatar-label {
    display: block; cursor: pointer; position: relative;
    width: 72px; height: 72px; border-radius: 50%;
  }

  .avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff5a5f, #d97706);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.6rem; font-weight: 700; color: white;
    box-shadow: 0 8px 24px rgba(255,90,95,0.35);
  }

  .avatar-img {
    width: 72px; height: 72px;
    border-radius: 50%; object-fit: cover;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    display: block;
  }

  .avatar-overlay {
    position: absolute; inset: 0; border-radius: 50%;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 0.72rem; font-weight: 700;
    opacity: 0; transition: opacity 0.18s;
    text-transform: uppercase; letter-spacing: 0.05em;
  }

  .avatar-label:hover .avatar-overlay { opacity: 1; }

  .avatar-input { display: none; }

  .avatar-remove {
    position: absolute; top: -4px; right: -4px;
    width: 20px; height: 20px; border-radius: 50%;
    background: #ff5a5f; border: 2px solid #09090b;
    color: white; font-size: 0.6rem; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    padding: 0; line-height: 1;
  }

  .avatar-remove:hover { background: #ff2d33; }

  .avatar-error { color: #ff8a8e; font-size: 0.8rem; margin-top: 0.2rem; }

  .header-info { display: flex; flex-direction: column; gap: 0.35rem; }
  h1 {
    margin: 0; font-size: 1.7rem; font-weight: 700; line-height: 1;
    background: linear-gradient(135deg, #ffffff 30%, #ffd6e7 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .email { color: #8d8d92; font-size: 0.9rem; }

  .role-badge {
    display: inline-block; width: fit-content;
    padding: 0.2rem 0.65rem; border-radius: 999px;
    font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .role-badge.admin { background: rgba(217,119,6,0.18); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
  .role-badge.user  { background: rgba(255,255,255,0.08); color: #b4b4b7; border: 1px solid rgba(255,255,255,0.12); }

  /* ── Stats ── */
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }

  .stat-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 1.25rem 1rem;
    display: flex; flex-direction: column; align-items: center; gap: 0.3rem; text-align: center;
  }

  .stat-num { font-size: 2rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; color: #ff5a5f; line-height: 1; }
  .stat-label { font-size: 0.78rem; color: #8d8d92; font-weight: 600; }

  /* ── Alert ── */
  .alert { padding: 0.7rem 1rem; border-radius: 12px; font-size: 0.88rem; font-weight: 500; }
  .alert.success { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); color: #86efac; }

  /* ── Picker Section ── */
  .section {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px; padding: 1.5rem;
    display: flex; flex-direction: column; gap: 1rem;
  }

  .section-head { display: flex; align-items: center; justify-content: space-between; }

  h2 { margin: 0; font-size: 0.88rem; font-weight: 700; color: #8d8d92; text-transform: uppercase; letter-spacing: 0.08em; }

  /* ── Current fav display ── */
  .fav-item { display: flex; gap: 1.25rem; align-items: flex-start; }

  .fav-poster {
    width: 90px; height: 130px; object-fit: cover;
    border-radius: 12px; flex-shrink: 0;
    box-shadow: 0 12px 30px rgba(0,0,0,0.5);
  }
  .fav-poster.no-poster {
    background: rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center; font-size: 2rem;
  }
  .fav-info { display: flex; flex-direction: column; gap: 0.4rem; padding-top: 0.2rem; }
  .fav-genre { font-size: 0.78rem; color: #8d8d92; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .fav-title { font-size: 1.2rem; font-weight: 700; color: #f5f5f5; line-height: 1.2; }

  .empty-hint { margin: 0; color: #8d8d92; font-size: 0.88rem; padding: 0.5rem 0; }

  /* ── Picker ── */
  .picker { display: flex; flex-direction: column; gap: 1rem; }
  .picker-hint { margin: 0; font-size: 0.88rem; color: #8d8d92; }

  .movie-list {
    display: flex; flex-direction: column; gap: 0.4rem;
    max-height: 280px; overflow-y: auto; padding-right: 4px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent;
  }

  .movie-option {
    display: flex; align-items: center; gap: 0.9rem;
    padding: 0.6rem 0.75rem; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    cursor: pointer; text-align: left; width: 100%;
    transition: all 0.15s; font-family: inherit; color: #f5f5f5;
  }
  .movie-option:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.14); }
  .movie-option.selected { background: rgba(255,90,95,0.12); border-color: rgba(255,90,95,0.35); }

  .movie-option img, .no-thumb {
    width: 36px; height: 52px; object-fit: cover; border-radius: 6px; flex-shrink: 0;
  }
  .no-thumb { background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }

  .movie-option-info { flex: 1; min-width: 0; }
  .movie-option-title { display: block; font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .movie-option-meta { display: block; font-size: 0.78rem; color: #8d8d92; margin-top: 0.15rem; }
  .check { color: #ff5a5f; font-weight: 700; font-size: 1rem; flex-shrink: 0; }

  .picker-actions { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }

  /* ── Buttons ── */
  .btn-primary {
    padding: 0.7rem 1.25rem; background: #ff5a5f; color: white;
    border: none; border-radius: 999px; font-size: 0.9rem; font-weight: 700;
    cursor: pointer; transition: background 0.2s, transform 0.15s; font-family: inherit;
  }
  .btn-primary:hover:not(:disabled) { background: #ff6c72; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.55; cursor: default; }

  .btn-ghost {
    padding: 0.5rem 0.9rem; background: none;
    border: 1px solid rgba(255,255,255,0.14); color: #b4b4b7;
    border-radius: 999px; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.07); color: #f5f5f5; }

  .btn-remove {
    margin-top: 0.5rem; padding: 0.4rem 0.85rem;
    background: rgba(255,90,95,0.1); border: 1px solid rgba(255,90,95,0.25); color: #ff8a8e;
    border-radius: 8px; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .btn-remove:hover { background: rgba(255,90,95,0.22); }

  .btn-add-fav {
    width: 100%; padding: 0.85rem;
    background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.18); color: #8d8d92;
    border-radius: 14px; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .btn-add-fav:hover { background: rgba(255,90,95,0.07); border-color: rgba(255,90,95,0.3); color: #ff8a8e; }

  /* ── Account Info ── */
  .info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 1.5rem; }
  .info-rows { display: flex; flex-direction: column; }
  .info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .info-row:last-child { border-bottom: none; padding-bottom: 0; }
  .info-label { font-size: 0.9rem; color: #8d8d92; }
  .info-value { font-size: 0.9rem; font-weight: 600; color: #f5f5f5; }
  .capitalize { text-transform: capitalize; }

  /* ── Admin Card ── */
  .admin-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; background: rgba(217,119,6,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 20px; }
  .admin-icon { font-size: 1.75rem; flex-shrink: 0; }
  .admin-card strong { display: block; font-size: 0.95rem; color: #fbbf24; margin-bottom: 0.2rem; }
  .admin-card p { margin: 0; font-size: 0.82rem; color: #8d8d92; line-height: 1.4; }
  .admin-link { margin-left: auto; padding: 0.6rem 1.1rem; background: rgba(217,119,6,0.2); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); border-radius: 999px; text-decoration: none; font-size: 0.85rem; font-weight: 700; white-space: nowrap; transition: background 0.2s; flex-shrink: 0; }
  .admin-link:hover { background: rgba(217,119,6,0.35); }

  @media (max-width: 680px) {
    .page { padding: 1.25rem 0.85rem; }

    .profile-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem 1.25rem;
    }

    h1 { font-size: 1.45rem; }
    .email { font-size: 0.82rem; }

    .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }

    .stat-card { padding: 0.9rem 0.5rem; }
    .stat-num { font-size: 1.6rem; }
    .stat-label { font-size: 0.7rem; }

    .section { padding: 1.1rem; }

    .picker-actions { flex-direction: column; align-items: stretch; }
    .picker-actions form,
    .picker-actions button { width: 100%; }
    .btn-primary { width: 100%; }

    .info-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.2rem;
    }

    .info-value { font-size: 0.85rem; word-break: break-all; }

    .admin-card { flex-wrap: wrap; padding: 1rem; }
    .admin-icon { display: none; }
    .admin-link { margin-left: 0; width: 100%; text-align: center; }
  }
</style>
