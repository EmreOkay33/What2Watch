<script>
  import favicon from '$lib/assets/favicon.svg';
  import { page } from '$app/stores';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { favorites, watchlist, watched, customMovies } from '$lib/stores';

  function clearUserData() {
    favorites.set([]);
    watchlist.set([]);
    watched.set([]);
    customMovies.set([]);
  }

  let { children, data } = $props();

  const nav = [
    { href: '/', label: 'Start' },
    { href: '/swipe', label: 'Swipe' },
    { href: '/favorites', label: 'Favoriten' },
    { href: '/friends', label: 'Freunde' },
    { href: '/watchlist', label: 'To Watch' }
  ];
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header>
  <div class="top-bar">
    <a href="/" class="brand">what2watch</a>
    <nav class="top-nav">
      {#each nav as item}
        <a href={item.href} class:selected={item.href === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(item.href)}>{item.label}</a>
      {/each}
      {#if data.user?.role === 'admin'}
        <a href="/admin" class:selected={$page.url.pathname.startsWith('/admin')} class="admin-link">Admin</a>
      {/if}
    </nav>

    <div class="user-area">
      {#if data.user}
        <a href="/profile" class="username" class:active={$page.url.pathname === '/profile'} data-sveltekit-reload>
          {data.user.username}
          {#if data.user.role === 'admin'}<span class="badge">Admin</span>{/if}
        </a>
        <form method="POST" action="/logout" use:enhance={() => {
          return async ({ result }) => {
            if (result.type === 'redirect') { clearUserData(); goto(result.location, { invalidateAll: true }); }
          };
        }}>
          <button type="submit" class="logout-btn">Abmelden</button>
        </form>
      {:else}
        <a href="/login" class="login-link" class:selected={$page.url.pathname === '/login'}>Anmelden</a>
        <a href="/register" class="register-link" class:selected={$page.url.pathname === '/register'}>Registrieren</a>
      {/if}
    </div>
  </div>
</header>

<main>
  {#key $page.url.pathname}
    <div in:fly={{ y: 14, duration: 260, easing: cubicOut }}>
      {@render children()}
    </div>
  {/key}
</main>

<!-- Bottom Navigation (mobile only) -->
{#if data.user}
  <nav class="bottom-nav">
    <a href="/" class="bnav-item" class:bnav-active={$page.url.pathname === '/'}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      <span>Start</span>
    </a>
    <a href="/swipe" class="bnav-item" class:bnav-active={$page.url.pathname === '/swipe'}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      <span>Swipe</span>
    </a>
    <a href="/favorites" class="bnav-item" class:bnav-active={$page.url.pathname === '/favorites'}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
      <span>Favoriten</span>
    </a>
    <a href="/friends" class="bnav-item" class:bnav-active={$page.url.pathname.startsWith('/friends')}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      <span>Freunde</span>
    </a>
    <a href="/watchlist" class="bnav-item" class:bnav-active={$page.url.pathname === '/watchlist'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <span>To Watch</span>
    </a>
    <a href="/profile" class="bnav-item" class:bnav-active={$page.url.pathname === '/profile'}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      <span>Profil</span>
    </a>
  </nav>
{/if}

<style>
  :global(*) { box-sizing: border-box; }

  :global(html) {
    background: #09090b;
    color-scheme: dark;
  }

  :global(body) {
    margin: 0;
    background:
      radial-gradient(ellipse 70% 50% at 5% 0%, rgba(255,90,95,0.08) 0%, transparent 55%),
      radial-gradient(ellipse 55% 45% at 95% 100%, rgba(168,85,247,0.08) 0%, transparent 55%),
      linear-gradient(180deg, rgba(255,255,255,0.04), rgba(9,9,11,0) 260px),
      #09090b;
    color: #f5f5f5;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  :global(h1), :global(h2), :global(h3) {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    letter-spacing: -0.02em;
  }

  header {
    background: rgba(9,9,11,0.78);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0.8rem 1.5rem;
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .top-bar {
    max-width: 1180px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 0.35rem;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 999px;
    background: rgba(255,255,255,0.04);
    box-shadow: 0 18px 50px rgba(0,0,0,0.28);
  }

  @keyframes brand-shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }

  .brand {
    font-weight: 900;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    text-decoration: none;
    padding-inline: 1.1rem;
    background: linear-gradient(90deg, #ff8a8e, #ff5a5f, #c026d3, #ff5a5f, #ff8a8e);
    background-size: 300% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: brand-shimmer 5s linear infinite;
  }

  .top-nav {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  /* ── Bottom Navigation ── */
  .bottom-nav {
    display: none;
  }

  .bnav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.22rem;
    padding: 0.35rem 0.9rem;
    text-decoration: none;
    color: #6d6d72;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    transition: color 0.18s;
    -webkit-tap-highlight-color: transparent;
    border-radius: 12px;
  }

  .bnav-item svg {
    width: 23px;
    height: 23px;
    flex-shrink: 0;
  }

  .bnav-item.bnav-active { color: #ff5a5f; }
  .bnav-item:hover { color: #f5f5f5; background: none; }

  a {
    text-decoration: none;
    color: #b4b4b7;
    padding: 0.62rem 0.92rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  a:hover { color: #f5f5f5; background: rgba(255,255,255,0.08); }

  .selected {
    color: #fff;
    background: linear-gradient(135deg, #ff5a5f, #c026d3);
    box-shadow: 0 10px 28px rgba(192,38,211,0.22), 0 6px 16px rgba(255,90,95,0.22);
  }
  .selected:hover { background: linear-gradient(135deg, #ff6c72, #d040e4); }

  .admin-link { color: #fbbf24; }
  .admin-link:hover { color: #fde68a; background: rgba(251,191,36,0.1); }
  .admin-link.selected { background: #d97706; color: white; box-shadow: 0 10px 24px rgba(217,119,6,0.3); }

  .user-area {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-inline-end: 0.5rem;
  }

  .username {
    font-size: 0.85rem;
    font-weight: 600;
    color: #d8d8da;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    text-decoration: none;
    padding: 0.5rem 0.75rem;
    border-radius: 999px;
    transition: all 0.2s;
  }

  .username:hover { color: #f5f5f5; background: rgba(255,255,255,0.08); }
  .username.active { color: #fff; background: rgba(255,255,255,0.1); }

  .badge {
    background: #d97706;
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .logout-btn {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    color: #b4b4b7;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .logout-btn:hover { background: rgba(255,90,95,0.15); color: #ff8a8e; border-color: rgba(255,90,95,0.3); }

  .login-link, .register-link {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .register-link {
    background: #ff5a5f;
    color: white !important;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
  }

  .register-link:hover { background: #ff6c72 !important; }

  main { min-height: calc(100vh - 72px); background: #09090b; }

  @media (max-width: 760px) {
    header { padding: 0.6rem 0.75rem; }

    .top-bar {
      border-radius: 18px;
      flex-wrap: nowrap;
      justify-content: space-between;
      padding: 0.25rem 0.25rem 0.25rem 0.4rem;
    }

    /* Hide top nav links — moved to bottom nav */
    .top-nav { display: none; }

    .brand { width: auto; font-size: 0.85rem; padding-inline: 0.6rem; }

    .user-area {
      width: auto;
      padding-inline-end: 0.25rem;
      gap: 0.35rem;
    }

    .username { font-size: 0.78rem; padding: 0.35rem 0.5rem; }
    .logout-btn { font-size: 0.75rem; padding: 0.38rem 0.65rem; }
    .login-link { font-size: 0.78rem; }
    .register-link { font-size: 0.78rem; padding: 0.38rem 0.7rem; }

    /* Show bottom nav */
    .bottom-nav {
      display: flex;
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 1000;
      background: rgba(9, 9, 11, 0.96);
      backdrop-filter: blur(24px) saturate(1.4);
      -webkit-backdrop-filter: blur(24px) saturate(1.4);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.45rem;
      padding-bottom: max(0.45rem, env(safe-area-inset-bottom));
      justify-content: space-around;
      align-items: center;
    }

    /* Lift main content above bottom nav */
    :global(main) {
      padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
    }
  }
</style>
