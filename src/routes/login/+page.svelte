<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { favorites, watchlist, watched, customMovies } from '$lib/stores';
  let { form } = $props();

  let loading = $state(false);
</script>

<section class="page">
  <div class="card">
    <h1>Anmelden</h1>
    <p>Willkommen zurück.</p>

    <form method="POST" use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'redirect') {
          favorites.set([]); watchlist.set([]); watched.set([]); customMovies.set([]);
          try {
            const res = await fetch('/api/user-data');
            if (res.ok) {
              const userData = await res.json();
              if (userData.likedMovies?.length) favorites.set(userData.likedMovies);
              if (userData.watchlist?.length) watchlist.set(userData.watchlist);
              if (userData.watched?.length) watched.set(userData.watched);
            }
          } catch {}
          goto(result.location, { invalidateAll: true });
        } else if (result.type === 'failure') {
          form = result.data;
        }
      };
    }}>
      {#if form?.error}
        <div class="error">{form.error}</div>
      {/if}

      <label>
        E-Mail
        <input type="email" name="email" placeholder="du@beispiel.com" required />
      </label>
      <label>
        Passwort
        <input type="password" name="password" placeholder="Dein Passwort" required />
      </label>

      <button type="submit" disabled={loading}>{loading ? 'Anmelden…' : 'Anmelden'}</button>
    </form>

    <p class="switch">Noch kein Account? <a href="/register">Registrieren</a></p>
  </div>
</section>

<style>
  .page {
    min-height: calc(100vh - 72px);
    display: grid;
    place-items: center;
    padding: 2rem 1.5rem;
    background: #09090b;
  }

  .card {
    width: 100%;
    max-width: 440px;
    background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), #111214;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 28px;
    padding: clamp(1.5rem, 5vw, 2.5rem);
    box-shadow: 0 30px 90px rgba(0,0,0,0.4);
  }

  h1 {
    margin: 0 0 0.4rem;
    font-size: 2rem;
    font-weight: 700;
  }

  p {
    margin: 0 0 1.5rem;
    color: #b4b4b7;
    font-size: 0.9rem;
  }

  form {
    display: grid;
    gap: 1rem;
  }

  .error {
    padding: 0.75rem 1rem;
    border-radius: 12px;
    background: rgba(255, 90, 95, 0.12);
    border: 1px solid rgba(255, 90, 95, 0.3);
    color: #ff8a8e;
    font-size: 0.9rem;
  }

  label {
    display: grid;
    gap: 0.4rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: #d8d8da;
  }

  input {
    padding: 0.85rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: #f5f5f5;
    font: inherit;
    outline: none;
    transition: border-color 0.2s;
  }

  input:focus {
    border-color: #ff5a5f;
    background: rgba(255,255,255,0.09);
  }

  input::placeholder { color: #8d8d92; }

  button {
    margin-top: 0.25rem;
    padding: 0.9rem;
    border: none;
    border-radius: 999px;
    background: #ff5a5f;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }

  button:hover {
    background: #ff6c72;
    transform: translateY(-1px);
  }

  .switch {
    margin: 1.25rem 0 0;
    text-align: center;
    font-size: 0.88rem;
  }

  .switch a {
    color: #ff5a5f;
    text-decoration: none;
    font-weight: 600;
  }
</style>
