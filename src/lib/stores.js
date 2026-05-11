import { browser } from '$app/environment';
import { writable } from 'svelte/store';

function persisted(key, initialValue) {
  const store = writable(initialValue);

  if (browser) {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        store.set(JSON.parse(saved));
      } catch {
        store.set(initialValue);
      }
    }

    store.subscribe((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return store;
}

export const favorites = persisted('what2watch-favorites', []);
export const watchlist = persisted('what2watch-watchlist', []);
export const watched = persisted('what2watch-watched', []);
export const customMovies = persisted('what2watch-custom-movies', []);
