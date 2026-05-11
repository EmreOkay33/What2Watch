<script>
  import { favorites, watchlist } from '$lib/stores';
</script>

<section class="hero">
  <div class="hero-card">
    <h1>what2watch</h1>
    <p>Deine App zum Entdecken, Merken und Verwalten von Filmen und Serien. Swipe neue Titel nach rechts, speichere Favoriten und plane deine nächste Watchlist.</p>

    <div class="stats">
      <div>
        <strong>{$favorites.length}</strong>
        <span>Favoriten</span>
      </div>
      <div>
        <strong>{$watchlist.length}</strong>
        <span>To Watch</span>
      </div>
    </div>

    <div class="actions">
      <a href="/swipe">Jetzt swipen</a>
      <a href="/favorites">Favoriten ansehen</a>
      <a href="/watchlist">To-Watch-Liste</a>
    </div>
  </div>
</section>

<style>
  .hero {
    padding: 2rem 1.5rem;
    display: flex;
    justify-content: center;
  }

  .hero-card {
    max-width: 900px;
    width: 100%;
    background: white;
    border-radius: 24px;
    padding: 2rem;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.08);
  }

  h1 {
    margin: 0 0 1rem;
    font-size: 2.4rem;
  }

  p {
    margin: 0 0 1.75rem;
    color: #555;
    line-height: 1.7;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1.75rem;
  }

  .stats div {
    background: #f4f4f6;
    border-radius: 18px;
    padding: 1.25rem;
    text-align: center;
  }

  strong {
    display: block;
    font-size: 2rem;
    margin-bottom: 0.25rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .actions a {
    flex: 1;
    min-width: 160px;
    text-align: center;
    padding: 0.95rem 1.3rem;
    background: #ff5a5f;
    color: white;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 700;
  }
</style>
