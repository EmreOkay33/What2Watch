import { TMDB_API_KEY } from '$env/static/private';

const BASE = 'https://api.themoviedb.org/3';
const IMG  = 'https://image.tmdb.org/t/p/w185';

async function tmdb(path) {
  if (!TMDB_API_KEY) return null;
  const res = await fetch(`${BASE}${path}?api_key=${TMDB_API_KEY}&language=de-DE`);
  if (!res.ok) return null;
  return res.json();
}

async function tmdbQ(path, params = '') {
  if (!TMDB_API_KEY) return null;
  const res = await fetch(`${BASE}${path}?api_key=${TMDB_API_KEY}&language=de-DE&${params}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getTmdbPoster(title, year, type = 'movie') {
  const isMovie = type !== 'series';
  const endpoint = isMovie ? '/search/movie' : '/search/tv';
  const yearParam = isMovie ? `year=${year}` : `first_air_date_year=${year}`;

  const s1 = await tmdbQ(endpoint, `query=${encodeURIComponent(title)}&${yearParam}`);
  if (s1?.results?.[0]?.poster_path) {
    return `https://image.tmdb.org/t/p/w500${s1.results[0].poster_path}`;
  }
  // Fallback ohne Jahr
  const s2 = await tmdbQ(endpoint, `query=${encodeURIComponent(title)}`);
  if (s2?.results?.[0]?.poster_path) {
    return `https://image.tmdb.org/t/p/w500${s2.results[0].poster_path}`;
  }
  return null;
}

export async function getTmdbDetails(title, year, type = 'movie') {
  const isMovie = type !== 'series';
  const endpoint = isMovie ? '/search/movie' : '/search/tv';
  const yearParam = isMovie ? `year=${year}` : `first_air_date_year=${year}`;

  const search = await tmdbQ(endpoint, `query=${encodeURIComponent(title)}&${yearParam}`);
  const match = search?.results?.[0];
  if (!match) return null;

  const id = match.id;
  const detailPath = isMovie ? `/movie/${id}` : `/tv/${id}`;

  const [details, credits, providers] = await Promise.all([
    tmdb(detailPath),
    tmdb(`${detailPath}/credits`),
    tmdb(`${detailPath}/watch/providers`)
  ]);

  const cast = (credits?.cast ?? []).slice(0, 5).map(p => ({
    name: p.name,
    character: p.character,
    photo: p.profile_path ? `${IMG}${p.profile_path}` : null
  }));

  const chProviders = providers?.results?.CH ?? providers?.results?.DE ?? providers?.results?.US ?? {};
  const streaming = [
    ...(chProviders.flatrate ?? []),
    ...(chProviders.free ?? [])
  ].map(p => ({ name: p.provider_name, logo: `https://image.tmdb.org/t/p/w45${p.logo_path}` }));

  if (isMovie) {
    return {
      cast,
      streaming,
      runtime: details?.runtime ?? null,
      tagline: details?.tagline ?? null,
      rating: details?.vote_average ? Math.round(details.vote_average * 10) / 10 : null,
      backdrop: details?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null
    };
  } else {
    return {
      cast,
      streaming,
      seasons: details?.number_of_seasons ?? null,
      episodes: details?.number_of_episodes ?? null,
      episodeRuntime: details?.episode_run_time?.[0] ?? null,
      tagline: details?.tagline ?? null,
      rating: details?.vote_average ? Math.round(details.vote_average * 10) / 10 : null,
      backdrop: details?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null
    };
  }
}
