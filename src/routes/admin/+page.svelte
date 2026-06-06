<script>
  import { enhance } from '$app/forms';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { data, form } = $props();

  let activeTab = $state('users');
  let searchUsers = $state('');
  let searchMovies = $state('');
  let movieTypeFilter = $state('all');
  let showAddMovie = $state(false);
  let confirmDelete = $state(null);
  let addPosterPreview = $state('');
  let addPosterData = $state('');

  function handleAddPoster(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { addPosterPreview = reader.result; addPosterData = reader.result; };
    reader.readAsDataURL(file);
  }

  function resetAddForm() {
    addPosterPreview = '';
    addPosterData = '';
  }

  let filteredUsers = $derived(
    data.users.filter(u =>
      u.username?.toLowerCase().includes(searchUsers.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUsers.toLowerCase())
    )
  );

  const moviesCount  = $derived(data.movies.filter(m => !m.type || m.type === 'movie').length);
  const seriesCount  = $derived(data.movies.filter(m => m.type === 'series').length);

  let filteredMovies = $derived(
    data.movies.filter(m => {
      const matchesType =
        movieTypeFilter === 'all' ||
        (movieTypeFilter === 'movie' ? (!m.type || m.type === 'movie') : m.type === 'series');
      const q = searchMovies.toLowerCase();
      const matchesSearch = !q || m.title?.toLowerCase().includes(q) || m.genre?.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    })
  );
</script>

<div class="page">
  <div class="header">
    <h1>Admin Panel</h1>
    <p>Verwaltung von Benutzern und Filmen</p>
  </div>

  <div class="stats">
    <div class="stat">
      <span class="stat-num">{data.users.length}</span>
      <span class="stat-label">Benutzer</span>
    </div>
    <div class="stat">
      <span class="stat-num">{data.movies.length}</span>
      <span class="stat-label">Filme & Serien</span>
    </div>
    <div class="stat">
      <span class="stat-num">{data.users.filter(u => u.role === 'admin').length}</span>
      <span class="stat-label">Admins</span>
    </div>
  </div>

  {#if form?.error}
    <div class="alert error" in:fly={{ y: -8, duration: 220 }}>{form.error}</div>
  {/if}
  {#if form?.success || form?.movieSuccess}
    <div class="alert success" in:fly={{ y: -8, duration: 220 }}>
      {form.movieSuccess ? 'Film erfolgreich hinzugefügt!' : 'Änderung gespeichert!'}
    </div>
  {/if}

  <div class="tabs">
    <button class="tab" class:active={activeTab === 'users'} onclick={() => activeTab = 'users'}>
      Benutzer ({data.users.length})
    </button>
    <button class="tab" class:active={activeTab === 'movies'} onclick={() => activeTab = 'movies'}>
      Filme & Serien ({data.movies.length})
    </button>
  </div>

  {#if activeTab === 'users'}
    <div in:fly={{ x: -16, duration: 240, easing: cubicOut }}>
      <div class="toolbar">
        <input
          type="search"
          placeholder="Benutzer suchen..."
          bind:value={searchUsers}
          class="search"
        />
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Benutzer</th>
              <th>E-Mail</th>
              <th>Rolle</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredUsers as user, i}
              <tr in:fly={{ y: 12, duration: 200, delay: i * 30, easing: cubicOut }}>
                <td>
                  <div class="user-cell">
                    <div class="avatar">{user.username?.[0]?.toUpperCase() ?? '?'}</div>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td class="muted">{user.email}</td>
                <td>
                  <form method="POST" action="?/changeRole" use:enhance>
                    <input type="hidden" name="userId" value={user._id} />
                    <select name="role" onchange={(e) => e.currentTarget.form.requestSubmit()} class="role-select" class:admin={user.role === 'admin'}>
                      <option value="user" selected={user.role === 'user'}>User</option>
                      <option value="admin" selected={user.role === 'admin'}>Admin</option>
                    </select>
                  </form>
                </td>
                <td>
                  <form method="POST" action="?/deleteUser" use:enhance>
                    <input type="hidden" name="userId" value={user._id} />
                    <button type="submit" class="btn-danger btn-sm"
                      onclick={(e) => { if (!confirm(`Benutzer "${user.username}" wirklich löschen?`)) e.preventDefault(); }}>
                      Löschen
                    </button>
                  </form>
                </td>
              </tr>
            {/each}
            {#if filteredUsers.length === 0}
              <tr><td colspan="4" class="empty">Keine Benutzer gefunden.</td></tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>

  {:else}
    <div in:fly={{ x: 16, duration: 240, easing: cubicOut }}>
      <div class="toolbar">
        <input
          type="search"
          placeholder="Suchen..."
          bind:value={searchMovies}
          class="search"
        />
        <div class="type-filter">
          <button class="tf-btn" class:active={movieTypeFilter === 'all'}   onclick={() => movieTypeFilter = 'all'}>
            Alle <span class="tf-count">{data.movies.length}</span>
          </button>
          <button class="tf-btn" class:active={movieTypeFilter === 'movie'} onclick={() => movieTypeFilter = 'movie'}>
            🎬 Filme <span class="tf-count">{moviesCount}</span>
          </button>
          <button class="tf-btn" class:active={movieTypeFilter === 'series'} onclick={() => movieTypeFilter = 'series'}>
            📺 Serien <span class="tf-count">{seriesCount}</span>
          </button>
        </div>
        <button class="btn-primary" onclick={() => showAddMovie = !showAddMovie}>
          {showAddMovie ? 'Abbrechen' : '+ Hinzufügen'}
        </button>
      </div>

      {#if showAddMovie}
        <div class="add-form" in:fly={{ y: -12, duration: 240, easing: cubicOut }}>
          <h3>Neuen Film hinzufügen</h3>
          {#if form?.movieError}
            <div class="alert error">{form.movieError}</div>
          {/if}
          <form method="POST" action="?/addMovie" use:enhance={() => () => { showAddMovie = false; resetAddForm(); }}>
            <input type="hidden" name="poster" value={addPosterData} />

            <div class="add-layout">
              <!-- Poster Upload -->
              <div class="poster-col">
                <label class="poster-upload-label">
                  {#if addPosterPreview}
                    <img src={addPosterPreview} alt="Vorschau" class="poster-preview" />
                    <span class="poster-change-hint">Ändern</span>
                  {:else}
                    <div class="poster-placeholder">
                      <span class="poster-icon">🎬</span>
                      <span class="poster-cta">Poster hochladen</span>
                      <span class="poster-sub">JPG, PNG, WEBP</span>
                    </div>
                  {/if}
                  <input type="file" accept="image/*" onchange={handleAddPoster} class="poster-file-input" />
                </label>
              </div>

              <!-- Fields -->
              <div class="fields-col">
                <div class="form-grid">
                  <label>
                    Typ *
                    <select name="type" class="type-select">
                      <option value="movie">🎬 Film</option>
                      <option value="series">📺 Serie / Anime</option>
                    </select>
                  </label>
                  <label>
                    Titel *
                    <input type="text" name="title" placeholder="z.B. The Dark Knight" required />
                  </label>
                  <label>
                    Jahr *
                    <input type="number" name="year" placeholder="2024" min="1888" max="2100" required />
                  </label>
                  <label>
                    Genre *
                    <input type="text" name="genre" placeholder="z.B. Action, Drama, Anime" list="genre-suggestions" required />
                    <datalist id="genre-suggestions">
                      <option value="Action"></option><option value="Drama"></option><option value="Sci-Fi"></option>
                      <option value="Thriller"></option><option value="Komödie"></option><option value="Crime"></option>
                      <option value="Horror"></option><option value="Romanze"></option><option value="Animation"></option>
                      <option value="Anime"></option><option value="Fantasy"></option><option value="Dokumentation"></option>
                    </datalist>
                  </label>
                </div>
                <label class="full">
                  Beschreibung
                  <textarea name="description" placeholder="Kurze Beschreibung..." rows="3"></textarea>
                </label>
                <button type="submit" class="btn-primary">Hinzufügen</button>
              </div>
            </div>
          </form>
        </div>
      {/if}

      <div class="movie-grid">
        {#each filteredMovies as movie, i}
          <div class="movie-card" in:fly={{ y: 16, duration: 220, delay: i * 25, easing: cubicOut }}>
            {#if movie.poster}
              <img src={movie.poster} alt={movie.title} class="movie-poster" />
            {:else}
              <div class="movie-poster no-poster">🎬</div>
            {/if}
            <div class="movie-info">
              <div class="movie-title">{movie.title}</div>
              <div class="movie-meta">
                <span class="type-badge" class:series={movie.type === 'series'}>
                  {movie.type === 'series' ? '📺 Serie' : '🎬 Film'}
                </span>
                <span class="genre-badge">{movie.genre}</span>
                <span class="year">{movie.year}</span>
              </div>
              {#if movie.description}
                <p class="movie-desc">{movie.description}</p>
              {/if}
            </div>
            <form method="POST" action="?/deleteMovie" use:enhance class="movie-delete">
              <input type="hidden" name="movieId" value={movie._id} />
              <button type="submit" class="btn-danger btn-sm"
                onclick={(e) => { if (!confirm(`Film "${movie.title}" wirklich löschen?`)) e.preventDefault(); }}>
                Löschen
              </button>
            </form>
          </div>
        {/each}
        {#if filteredMovies.length === 0}
          <div class="empty-grid">Keine Filme gefunden.</div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .header { margin-bottom: 1.5rem; }

  h1 {
    margin: 0 0 0.3rem;
    font-size: 2rem;
    font-weight: 700;
  }

  .header p {
    margin: 0;
    color: #b4b4b7;
    font-size: 0.95rem;
  }

  .stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .stat {
    flex: 1;
    min-width: 120px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-num {
    font-size: 2rem;
    font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    color: #ff5a5f;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #b4b4b7;
    font-weight: 600;
  }

  .alert {
    padding: 0.8rem 1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .alert.error {
    background: rgba(255,90,95,0.12);
    border: 1px solid rgba(255,90,95,0.3);
    color: #ff8a8e;
  }

  .alert.success {
    background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.3);
    color: #86efac;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding-bottom: 0;
  }

  .tab {
    background: none;
    border: none;
    color: #b4b4b7;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 0.75rem 1.25rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all 0.2s;
    font-family: inherit;
  }

  .tab:hover { color: #f5f5f5; }
  .tab.active { color: #ff5a5f; border-bottom-color: #ff5a5f; }

  .toolbar {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .search {
    flex: 1;
    min-width: 200px;
    padding: 0.7rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: #f5f5f5;
    font: inherit;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .search:focus { border-color: #ff5a5f; }
  .search::placeholder { color: #8d8d92; }

  .type-filter {
    display: flex;
    gap: 0.3rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 999px;
    padding: 0.25rem;
  }

  .tf-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.85rem;
    border: none;
    border-radius: 999px;
    background: none;
    color: #8d8d92;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.18s;
    white-space: nowrap;
  }
  .tf-btn:hover { color: #f5f5f5; background: rgba(255,255,255,0.07); }
  .tf-btn.active { background: #ff5a5f; color: #fff; box-shadow: 0 4px 14px rgba(255,90,95,0.3); }

  .tf-count {
    background: rgba(255,255,255,0.15);
    border-radius: 999px;
    padding: 0.05rem 0.45rem;
    font-size: 0.72rem;
    font-weight: 800;
  }
  .tf-btn.active .tf-count { background: rgba(255,255,255,0.25); }

  .type-badge {
    background: rgba(255,255,255,0.08);
    color: #d8d8da;
    border-radius: 999px;
    padding: 0.18rem 0.6rem;
    font-size: 0.72rem;
    font-weight: 700;
  }
  .type-badge.series {
    background: rgba(99,102,241,0.15);
    color: #a5b4fc;
  }

  .table-wrap {
    overflow-x: auto;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    padding: 0.8rem 1rem;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8d8d92;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.9rem;
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: none; }

  .muted { color: #8d8d92; }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff5a5f, #d97706);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8rem;
    flex-shrink: 0;
  }

  .role-select {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    color: #f5f5f5;
    padding: 0.35rem 0.6rem;
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    outline: none;
  }

  .role-select.admin {
    border-color: rgba(251,191,36,0.4);
    color: #fbbf24;
  }

  .empty { text-align: center; color: #8d8d92; padding: 2rem; }

  .empty-grid {
    grid-column: 1 / -1;
    text-align: center;
    color: #8d8d92;
    padding: 3rem;
  }

  .btn-primary {
    padding: 0.65rem 1.2rem;
    background: #ff5a5f;
    color: white;
    border: none;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    font-family: inherit;
    white-space: nowrap;
  }

  .btn-primary:hover { background: #ff6c72; transform: translateY(-1px); }

  .btn-danger {
    padding: 0.5rem 1rem;
    background: rgba(255,90,95,0.12);
    color: #ff8a8e;
    border: 1px solid rgba(255,90,95,0.25);
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .btn-danger:hover { background: rgba(255,90,95,0.25); }

  .btn-sm { padding: 0.38rem 0.75rem; }

  .add-form {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .add-form h3 {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.85rem;
    margin-bottom: 0.85rem;
  }

  label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #d8d8da;
  }

  label.full { margin-bottom: 0.85rem; }

  input, textarea {
    padding: 0.7rem 0.9rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: #f5f5f5;
    font: inherit;
    font-size: 0.88rem;
    outline: none;
    transition: border-color 0.2s;
    resize: vertical;
  }

  input:focus, textarea:focus { border-color: #ff5a5f; }
  input::placeholder, textarea::placeholder { color: #8d8d92; }

  /* ── Add form layout ── */
  .add-layout {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 1.25rem;
    align-items: start;
  }

  .poster-col { flex-shrink: 0; }

  .poster-upload-label {
    position: relative;
    display: block;
    width: 160px;
    height: 230px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px dashed rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .poster-upload-label:hover { border-color: #ff5a5f; }

  .poster-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .poster-change-hint {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 700;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .poster-upload-label:hover .poster-change-hint { opacity: 1; }

  .poster-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }
  .poster-icon { font-size: 2rem; }
  .poster-cta { font-size: 0.78rem; font-weight: 700; color: #d8d8da; text-align: center; }
  .poster-sub { font-size: 0.7rem; color: #8d8d92; }

  .poster-file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .fields-col { display: flex; flex-direction: column; gap: 0.85rem; }

  @media (max-width: 600px) {
    .add-layout { grid-template-columns: 1fr; }
    .poster-upload-label { width: 100%; height: 180px; }
  }

  .type-select {
    padding: 0.7rem 0.9rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: #f5f5f5;
    font: inherit;
    font-size: 0.88rem;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
    width: 100%;
  }
  .type-select:focus { border-color: #ff5a5f; }
  .type-select option { background: #1a1a1e; }


  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
  }

  .movie-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s;
  }

  .movie-card:hover { border-color: rgba(255,255,255,0.15); }

  .movie-poster {
    width: 100%;
    height: 160px;
    object-fit: cover;
    display: block;
  }

  .movie-poster.no-poster {
    height: 160px;
    background: rgba(255,255,255,0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
  }

  .movie-info {
    padding: 0.9rem;
    flex: 1;
  }

  .movie-title {
    font-weight: 700;
    font-size: 0.95rem;
    margin-bottom: 0.4rem;
  }

  .movie-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .genre-badge {
    background: rgba(255,90,95,0.15);
    color: #ff8a8e;
    border-radius: 999px;
    padding: 0.18rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .year {
    color: #8d8d92;
    font-size: 0.82rem;
  }

  .movie-desc {
    margin: 0;
    font-size: 0.82rem;
    color: #8d8d92;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .movie-delete {
    padding: 0.75rem;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  @media (max-width: 600px) {
    .stats { gap: 0.5rem; }
    .stat { padding: 1rem; }
    .stat-num { font-size: 1.5rem; }
    .movie-grid { grid-template-columns: 1fr; }
  }
</style>
