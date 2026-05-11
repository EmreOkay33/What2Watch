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
    padding: 1.5rem;
    max-width: 980px;
    margin: 0 auto;
  }

  h1 {
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0;
    color: #666;
  }

  .movie-form {
    margin-top: 1.5rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }

  .fields {
    display: grid;
    gap: 1rem;
  }

  label {
    display: grid;
    gap: 0.5rem;
    font-weight: 700;
    color: #666;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.95rem 1rem;
    border-radius: 18px;
    border: 1px solid #d7d7d7;
    font: inherit;
    background: white;
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
  }

  .poster-panel {
    display: grid;
    gap: 1rem;
  }

  .panel-label {
    font-weight: 700;
  }

  .poster-upload {
    position: relative;
    display: grid;
    border-radius: 28px;
    overflow: hidden;
    min-height: 520px;
    background: #111214;
    border: 1px solid rgba(255, 255, 255, 0.08);
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
    background: linear-gradient(180deg, #18181b 0%, #111214 100%);
    font-size: 1rem;
  }

  .poster-placeholder button {
    min-width: 220px;
    padding: 1rem 1.6rem;
    margin: auto;
    border: none;
    border-radius: 999px;
    background: white;
    color: #666;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
  }

  .poster-placeholder button:hover {
    background: #f5f5f5;
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
    .layout-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
