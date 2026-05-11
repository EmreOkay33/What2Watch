<script>
  import { page } from '$app/stores';
  import { sampleMovies } from '$lib/movies';
  import { customMovies } from '$lib/stores';

  let movie = $state(null);

  $effect(() => {
    if (!$page.params.id) return;
    const allMovies = [...$customMovies, ...sampleMovies];
    movie = allMovies.find((item) => item.id === $page.params.id) || null;
  });
</script>

<section class="page">
  {#if movie}
    <div class="detail-card">
      <img src={movie.poster} alt={movie.title} />
      <div class="detail-meta">
        <h1>{movie.title}</h1>
        <p class="subtitle">{movie.genre} · {movie.year}</p>
        <p>{movie.description}</p>
        <a href="/swipe" class="button">Zurück zum Swipe</a>
      </div>
    </div>
  {:else}
    <div class="not-found">
      <h1>Film nicht gefunden</h1>
      <p>Dieser Film ist nicht in deiner Sammlung vorhanden.</p>
      <a href="/swipe" class="button">Zurück zum Swipe</a>
    </div>
  {/if}
</section>

<style>
  .page {
    padding: 1.5rem;
    max-width: 960px;
    margin: 0 auto;
  }

  .detail-card {
    display: grid;
    gap: 1.5rem;
  }

  img {
    width: 100%;
    border-radius: 24px;
    object-fit: cover;
    max-height: 520px;
  }

  .detail-meta {
    display: grid;
    gap: 1rem;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }

  .subtitle {
    color: #666;
  }

  .button {
    display: inline-flex;
    padding: 0.85rem 1.4rem;
    border-radius: 999px;
    background: #ff5a5f;
    color: white;
    text-decoration: none;
    font-weight: 700;
    width: fit-content;
  }

  .not-found {
    text-align: center;
    padding: 2rem;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
  }
</style>
