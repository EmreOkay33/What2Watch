<script>
  import { customMovies } from '$lib/stores';

  let title = $state('');
  let year = $state('');
  let genre = $state('');
  let description = $state('');
  let posterFile = $state(null);
  let posterPreview = $state('');
  let message = $state('');

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      posterFile = null;
      posterPreview = '';
      return;
    }

    posterFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      posterPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function addMovie(event) {
    event?.preventDefault();

    if (!title.trim()) {
      message = 'Bitte gib einen Filmtitel ein.';
      return;
    }

    const poster = posterPreview
      ? posterPreview
      : `https://picsum.photos/seed/${encodeURIComponent(title)}/360/520`;

    const movie = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      year: year.trim() || 'Unbekannt',
      genre: genre.trim() || 'Unbekannt',
      description: description.trim() || 'Keine Beschreibung vorhanden.',
      poster
    };

    customMovies.update((list) => [movie, ...list]);

    title = '';
    year = '';
    genre = '';
    description = '';
    posterFile = null;
    posterPreview = '';
    message = 'Film erfolgreich hinzugefügt und steht nun zum Swipen bereit.';
  }
</script>

<section class="page">
  <h1>Eigenen Film hinzufügen</h1>
  <p>Füge eigene Filme oder Serien zur Swipe-Sammlung hinzu. Sie erscheinen dann direkt im Swipe-Deck.</p>

  <form class="movie-form" onsubmit={addMovie}>
    <div class="layout-grid">
      <div class="poster-panel">
        <span class="panel-label">Poster</span>
        <label class="poster-upload">
          {#if posterPreview}
            <img src={posterPreview} alt="Poster-Vorschau" />
          {:else}
            <div class="poster-placeholder">
              <button type="button">Poster hochladen</button>
            </div>
          {/if}
          <input type="file" accept="image/*" onchange={handleFileChange} />
        </label>
        <p class="hint">Max. Größe 5MB. JPG, PNG oder WEBP.</p>
      </div>

      <div class="fields">
        <label>
          Titel
          <input bind:value={title} placeholder="Filmtitel" />
        </label>

        <label>
          Jahr
          <input bind:value={year} placeholder="2025" />
        </label>

        <label>
          Genre
          <input bind:value={genre} placeholder="Drama, Action, Komödie" />
        </label>

        <label>
          Beschreibung
          <textarea bind:value={description} placeholder="Kurze Beschreibung"></textarea>
        </label>

        <button type="submit">Hinzufügen</button>

        {#if message}
          <p class="message">{message}</p>
        {/if}
      </div>
    </div>
  </form>
</section>

<style>
  .page {
    min-height: 100vh;
    padding: 3rem 1.5rem;
    max-width: 1120px;
    margin: 0 auto;
    background: #09090b;
    color: #f5f5f5;
  }

  h1 {
    max-width: 780px;
    margin: 0 0 0.55rem;
    font-size: clamp(2.4rem, 6vw, 4.7rem);
    font-weight: 900;
    line-height: 0.98;
  }

  p {
    margin: 0;
    color: #b4b4b7;
    line-height: 1.6;
  }

  .movie-form {
    margin-top: 2rem;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 32px;
    background: rgba(255, 255, 255, 0.04);
    box-shadow:
      0 30px 90px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .layout-grid {
    display: grid;
    grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
  }

  .fields {
    display: grid;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 24px;
    background: #111214;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  label {
    display: grid;
    gap: 0.5rem;
    font-weight: 700;
    color: #f5f5f5;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.95rem 1rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    font: inherit;
    color: #f5f5f5;
    background: rgba(255, 255, 255, 0.06);
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  input:focus,
  textarea:focus {
    border-color: #ff5a5f;
    background: rgba(255, 255, 255, 0.09);
  }

  input::placeholder,
  textarea::placeholder {
    color: #8d8d92;
  }

  textarea {
    min-height: 160px;
    resize: vertical;
  }

  button {
    padding: 0.95rem 1.5rem;
    border: none;
    border-radius: 999px;
    background: #ff5a5f;
    color: white;
    font-weight: 700;
    cursor: pointer;
    width: fit-content;
    box-shadow: 0 16px 34px rgba(255, 90, 95, 0.22);
    transition: transform 0.2s ease, background 0.2s ease;
  }

  button:hover {
    transform: translateY(-2px);
    background: #ff6c72;
  }

  .poster-panel {
    display: grid;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 24px;
    background: #111214;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .panel-label {
    font-weight: 700;
  }

  .poster-upload {
    position: relative;
    display: grid;
    border-radius: 24px;
    overflow: hidden;
    min-height: 520px;
    background: #111214;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.36);
  }

  .poster-upload img,
  .poster-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    object-fit: cover;
  }

  .poster-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    justify-items: center;
    align-items: center;
    padding: 0;
    color: #b4b4b7;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0)),
      #111214;
    font-size: 1rem;
  }

  .poster-placeholder button {
    min-width: 220px;
    padding: 1rem 1.6rem;
    margin: auto;
    border: none;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    color: #f5f5f5;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.28);
  }

  .poster-placeholder button:hover {
    background: #ff5a5f;
  }

  .poster-upload input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .hint {
    margin: 0;
    color: #8d8d92;
    font-size: 0.95rem;
  }

  .message {
    margin: 0;
    color: #1c7c54;
    font-weight: 700;
  }

  @media (max-width: 900px) {
    .page {
      padding: 1.5rem 1rem;
    }

    .layout-grid {
      grid-template-columns: 1fr;
    }

    .poster-upload {
      min-height: 460px;
    }
  }
</style>
