<script>
  import { enhance } from '$app/forms';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { data } = $props();

  let query = $state('');
  let results = $state([]);
  let searching = $state(false);
  let searchTimer = null;

  function handleInput() {
    clearTimeout(searchTimer);
    if (query.trim().length < 2) { results = []; searching = false; return; }
    searching = true;
    searchTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        results = json.users ?? [];
      } catch { results = []; }
      searching = false;
    }, 280);
  }

  function ini(name) {
    return name.split(/\s+/).map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
  }

  function statusFor(id) {
    if (data.friends.some(f => f.userId === id)) return 'friends';
    if (data.pendingOutgoingIds.includes(id)) return 'pending';
    if (data.pendingIncoming.some(r => r.userId === id)) return 'incoming';
    return 'none';
  }
</script>

<section class="page">
  <div class="shell">

    <!-- Header -->
    <div class="top-bar">
      <h1>Freunde</h1>
      {#if data.pendingIncoming.length > 0}
        <span class="notif">{data.pendingIncoming.length} neue Anfrage{data.pendingIncoming.length > 1 ? 'n' : ''}</span>
      {/if}
    </div>

    <!-- Search -->
    <div class="search-card">
      <div class="search-row">
        <svg class="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          class="search-in"
          placeholder="Benutzer suchen…"
          bind:value={query}
          oninput={handleInput}
        />
        {#if query}
          <button class="s-clear" onclick={() => { query = ''; results = []; }}>✕</button>
        {/if}
      </div>

      {#if searching}
        <p class="s-hint">Suche…</p>
      {:else if query.length >= 2 && results.length === 0}
        <p class="s-hint">Kein Benutzer gefunden.</p>
      {:else if results.length > 0}
        <ul class="s-list">
          {#each results as u (u.id)}
            {@const st = statusFor(u.id)}
            <li class="s-item">
              <a href="/friends/{u.id}" class="s-user">
                {#if u.avatar}
                  <img src={u.avatar} alt={u.username} class="av sm" />
                {:else}
                  <div class="av-init sm">{ini(u.username)}</div>
                {/if}
                <span class="s-uname">{u.username}</span>
              </a>
              {#if st === 'friends'}
                <span class="chip green">Befreundet ✓</span>
              {:else if st === 'pending'}
                <span class="chip muted">Ausstehend</span>
              {:else if st === 'incoming'}
                <span class="chip amber">Anfrage erhalten</span>
              {:else}
                <a href="/friends/{u.id}" class="chip red">Anfragen →</a>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Pending Incoming -->
    {#if data.pendingIncoming.length > 0}
      <div class="section-card">
        <h2 class="sec-h">Freundschaftsanfragen <span class="ct">{data.pendingIncoming.length}</span></h2>
        <ul class="req-list">
          {#each data.pendingIncoming as req (req.friendshipId)}
            <li class="req-item" in:fly={{ y: 10, duration: 240, easing: cubicOut }}>
              <a href="/friends/{req.userId}" class="req-user">
                {#if req.avatar}
                  <img src={req.avatar} alt={req.username} class="av md" />
                {:else}
                  <div class="av-init md">{ini(req.username)}</div>
                {/if}
                <span class="req-name">{req.username}</span>
              </a>
              <div class="req-actions">
                <form method="POST" action="?/acceptRequest" use:enhance>
                  <input type="hidden" name="friendshipId" value={req.friendshipId} />
                  <button class="btn-yes" type="submit">Akzeptieren</button>
                </form>
                <form method="POST" action="?/rejectRequest" use:enhance>
                  <input type="hidden" name="friendshipId" value={req.friendshipId} />
                  <button class="btn-no" type="submit">Ablehnen</button>
                </form>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Friends List -->
    <div class="section-card">
      <h2 class="sec-h">Meine Freunde <span class="ct">{data.friends.length}</span></h2>
      {#if data.friends.length === 0}
        <p class="empty-msg">Noch keine Freunde hinzugefügt.<br />Suche nach einem Benutzer und schicke eine Anfrage!</p>
      {:else}
        <ul class="friend-list">
          {#each data.friends as f (f.friendshipId)}
            <li class="friend-item" in:fly={{ y: 10, duration: 240, easing: cubicOut }}>
              <a href="/friends/{f.userId}" class="friend-user">
                {#if f.avatar}
                  <img src={f.avatar} alt={f.username} class="av md" />
                {:else}
                  <div class="av-init md">{ini(f.username)}</div>
                {/if}
                <div class="f-info">
                  <span class="f-name">{f.username}</span>
                  <span class="f-sub">Profil & gemeinsame Filme ansehen →</span>
                </div>
              </a>
              <form method="POST" action="?/removeFriend" use:enhance>
                <input type="hidden" name="friendshipId" value={f.friendshipId} />
                <button class="btn-rem" type="submit" title="Freundschaft beenden">✕</button>
              </form>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

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
    max-width: 720px;
    margin: 0 auto;
    display: grid;
    gap: 1.25rem;
  }

  .top-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  h1 {
    margin: 0;
    font-size: clamp(2.4rem, 6vw, 4rem);
    font-weight: 900;
    line-height: 0.98;
    background: linear-gradient(135deg, #ffffff 30%, #a5f3fc 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .notif {
    background: rgba(255,90,95,0.15);
    border: 1px solid rgba(255,90,95,0.35);
    color: #ff8a8e;
    border-radius: 999px;
    padding: 0.3rem 0.85rem;
    font-size: 0.82rem;
    font-weight: 700;
  }

  /* ── Search ── */
  .search-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), #111214;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 1.1rem 1.25rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  }

  .search-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .search-ico {
    width: 18px; height: 18px;
    color: #6d6d72;
    flex-shrink: 0;
  }

  .search-in {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #f5f5f5;
    font-size: 1rem;
    font-family: inherit;
  }

  .search-in::placeholder { color: #5d5d61; }

  .s-clear {
    background: none; border: none;
    color: #6d6d72; cursor: pointer;
    font-size: 0.85rem; padding: 0.2rem;
    line-height: 1;
  }

  .s-hint {
    margin: 0.75rem 0 0;
    color: #6d6d72;
    font-size: 0.88rem;
  }

  .s-list {
    list-style: none; padding: 0; margin: 0.75rem 0 0;
    display: flex; flex-direction: column; gap: 0.3rem;
  }

  .s-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.55rem 0.5rem;
    border-radius: 12px;
    transition: background 0.15s;
  }

  .s-item:hover { background: rgba(255,255,255,0.04); }

  .s-user {
    display: flex; align-items: center; gap: 0.7rem;
    text-decoration: none; flex: 1; min-width: 0;
  }

  .s-uname {
    font-size: 0.95rem; font-weight: 600; color: #f5f5f5;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Avatars ── */
  .av, .av-init {
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700; color: white;
  }

  .av.sm, .av-init.sm { width: 36px; height: 36px; font-size: 0.8rem; }
  .av.md, .av-init.md { width: 44px; height: 44px; font-size: 0.9rem; }

  .av-init { background: linear-gradient(135deg, #ff5a5f, #d97706); }

  /* ── Chips ── */
  .chip {
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    white-space: nowrap;
    text-decoration: none;
    flex-shrink: 0;
    cursor: default;
  }

  .chip.green { background: rgba(34,197,94,0.12); color: #86efac; border: 1px solid rgba(34,197,94,0.25); }
  .chip.muted { background: rgba(255,255,255,0.06); color: #8d8d92; border: 1px solid rgba(255,255,255,0.12); }
  .chip.amber { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
  .chip.red   { background: rgba(255,90,95,0.12); color: #ff8a8e; border: 1px solid rgba(255,90,95,0.3); cursor: pointer; transition: background 0.15s; }
  .chip.red:hover { background: rgba(255,90,95,0.22); }

  /* ── Section cards ── */
  .section-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), #111214;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 1.5rem 1.5rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    display: flex; flex-direction: column; gap: 1rem;
  }

  .sec-h {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: #6d6d72;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: flex; align-items: center; gap: 0.5rem;
  }

  .ct {
    background: rgba(255,255,255,0.08);
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
    font-size: 0.75rem;
    color: #b4b4b7;
    font-weight: 700;
  }

  /* ── Pending requests ── */
  .req-list {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 0.5rem;
  }

  .req-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 0.75rem;
    border: 1px solid rgba(255,90,95,0.18);
    background: rgba(255,90,95,0.05);
    border-radius: 14px;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .req-user {
    display: flex; align-items: center; gap: 0.7rem;
    text-decoration: none; flex: 1; min-width: 0;
  }

  .req-name {
    font-size: 0.95rem; font-weight: 600; color: #f5f5f5;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .req-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

  .btn-yes, .btn-no {
    padding: 0.45rem 0.9rem;
    border: none; border-radius: 999px;
    font-size: 0.82rem; font-weight: 700;
    cursor: pointer; font-family: inherit;
    transition: all 0.18s;
  }

  .btn-yes { background: #16a34a; color: white; }
  .btn-yes:hover { background: #15803d; }
  .btn-no  { background: rgba(255,255,255,0.08); color: #b4b4b7; }
  .btn-no:hover  { background: rgba(255,90,95,0.15); color: #ff8a8e; }

  /* ── Friends list ── */
  .friend-list {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 0.4rem;
  }

  .friend-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 0.75rem;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.06);
    transition: background 0.15s, border-color 0.15s;
  }

  .friend-item:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.1);
  }

  .friend-user {
    display: flex; align-items: center; gap: 0.75rem;
    text-decoration: none; flex: 1; min-width: 0;
  }

  .f-info { display: flex; flex-direction: column; min-width: 0; }

  .f-name {
    font-size: 0.95rem; font-weight: 600; color: #f5f5f5;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .f-sub { font-size: 0.78rem; color: #6d6d72; }

  .btn-rem {
    background: none; border: 1px solid rgba(255,255,255,0.1);
    color: #6d6d72; border-radius: 50%;
    width: 30px; height: 30px;
    cursor: pointer; font-size: 0.7rem; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s;
  }

  .btn-rem:hover { background: rgba(255,90,95,0.12); border-color: rgba(255,90,95,0.3); color: #ff8a8e; }

  .empty-msg {
    margin: 0; color: #6d6d72; font-size: 0.92rem; line-height: 1.6;
    padding: 0.5rem 0;
  }

  @media (max-width: 680px) {
    .page { padding: 1.25rem 0.85rem; }
    h1 { font-size: clamp(1.8rem, 8vw, 2.6rem); }
    .section-card, .search-card { padding: 1.1rem 1rem; }
    .req-item { flex-wrap: wrap; }
    .req-actions { width: 100%; }
    .btn-yes, .btn-no { flex: 1; text-align: center; }
  }
</style>
