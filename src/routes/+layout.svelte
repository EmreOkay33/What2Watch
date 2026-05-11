<script>
  import favicon from '$lib/assets/favicon.svg';
  import { page } from '$app/stores';

  let { children } = $props();

  const nav = [
    { href: '/', label: 'Start' },
    { href: '/swipe', label: 'Swipe' },
    { href: '/favorites', label: 'Favoriten' },
    { href: '/watchlist', label: 'To Watch' },
    { href: '/add', label: 'Film hinzufügen' },
    { href: '/profile', label: 'Profil' }
  ];
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header>
  <div class="top-bar">
    <a href="/" class="brand">what2watch</a>
    <nav>
      {#each nav as item}
        <a href={item.href} class:selected={item.href === $page.url.pathname}>{item.label}</a>
      {/each}
    </nav>
  </div>
</header>

<main>
  {@render children()}
</main>

<style>
  header {
    background: #09090b;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1rem 1.5rem;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .top-bar {
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .brand {
    font-weight: 900;
    font-size: 1.35rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-decoration: none;
    color: #f5f5f5;
  }

  nav {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  a {
    text-decoration: none;
    color: #b4b4b7;
    padding: 0.65rem 0.95rem;
    border-radius: 999px;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  a:hover {
    color: #f5f5f5;
    background: rgba(255, 255, 255, 0.08);
  }

  .selected {
    color: #fff;
    background: #ff5a5f;
  }

  .selected:hover {
    background: #ff6c72;
  }

  main {
    min-height: calc(100vh - 76px);
    background: #09090b;
  }
</style>
