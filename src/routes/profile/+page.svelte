<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let name = $state('');
  let message = $state('');

  onMount(() => {
    if (browser) {
      const saved = localStorage.getItem('what2watch-profile');
      if (saved) {
        const data = JSON.parse(saved);
        name = data.name || '';
      }
    }
  });

  function saveProfile(event) {
    event?.preventDefault();
    if (!browser) return;
    localStorage.setItem('what2watch-profile', JSON.stringify({ name }));
    message = 'Profil gespeichert.';
  }
</script>

<section class="page">
  <h1>Profil</h1>
  <p>Du kannst hier deinen Namen speichern, damit sich die App persönlicher anfühlt.</p>

  <form onsubmit={saveProfile} class="profile-form">
    <label>
      Nutzername
      <input type="text" bind:value={name} placeholder="Dein Name" />
    </label>

    <button type="submit">Speichern</button>

    {#if message}
      <p class="message">{message}</p>
    {/if}
  </form>
</section>

<style>
  .page {
    padding: 1.5rem;
    max-width: 640px;
    margin: 0 auto;
  }

  .profile-form {
    display: grid;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  label {
    display: grid;
    gap: 0.5rem;
    font-weight: 700;
  }

  input {
    padding: 0.85rem 1rem;
    border-radius: 14px;
    border: 1px solid #d7d7d7;
  }

  button {
    width: fit-content;
    padding: 0.85rem 1.5rem;
    border: none;
    border-radius: 999px;
    background: #ff5a5f;
    color: white;
    font-weight: 700;
    cursor: pointer;
  }

  .message {
    color: #1c7c54;
    font-weight: 700;
  }
</style>
