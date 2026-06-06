<script>
  import { favorites, watchlist } from '$lib/stores';

  let { data } = $props();

  // 12 slots: position (%), rotation (deg), width (px), float duration (s), delay (s)
  const slots = [
    { x:  1, y:  5, r: -14, w: 115, dur: 6.2, d: 0.0 },
    { x:  7, y: 43, r:   8, w: 135, dur: 7.8, d: 2.1 },
    { x:  2, y: 73, r:  -6, w: 100, dur: 5.9, d: 4.3 },
    { x: 12, y: 25, r:  12, w:  90, dur: 8.1, d: 1.5 },
    { x: 77, y:  7, r:  10, w: 125, dur: 6.7, d: 3.2 },
    { x: 84, y: 39, r:  -9, w: 118, dur: 7.3, d: 0.8 },
    { x: 79, y: 69, r:   6, w: 105, dur: 9.0, d: 5.1 },
    { x: 89, y: 21, r: -12, w:  95, dur: 6.5, d: 2.7 },
    { x:  5, y: 87, r:   9, w:  88, dur: 7.1, d: 3.8 },
    { x: 86, y: 82, r:  -5, w: 110, dur: 8.4, d: 1.1 },
    { x: 17, y: 13, r: -18, w:  82, dur: 5.6, d: 4.6 },
    { x: 75, y: 55, r:  14, w:  93, dur: 7.9, d: 2.3 },
  ];

  const bgCards = $derived(
    slots
      .map((s, i) => ({ ...s, url: (data.posterUrls ?? [])[i] }))
      .filter(c => c.url)
  );
</script>

<section class="hero">

  <!-- ── Animated background ── -->
  <div class="bg" aria-hidden="true">
    <!-- 5 orbs: red · violet · magenta · cyan · rose -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="orb orb-4"></div>
    <div class="orb orb-5"></div>

    {#each bgCards as c, i (i)}
      <img
        class="bg-card"
        src={c.url}
        alt=""
        loading="lazy"
        decoding="async"
        style="left:{c.x}%; top:{c.y}%; width:{c.w}px; --rot:{c.r}deg; animation-duration:{c.dur}s; animation-delay:-{c.d}s;"
      />
    {/each}

    <!-- Film grain overlay -->
    <svg class="grain" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <filter id="grain-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-filter)"/>
    </svg>

    <div class="vignette"></div>
  </div>

  <!-- ── Hero content ── -->
  <div class="content">
    <div class="hero-card">
      <div class="chip">✦ Film &amp; Serien Entdecken</div>

      <h1>what2watch</h1>
      <p>Deine App zum Entdecken, Merken und Verwalten von Filmen und Serien. Swipe neue Titel nach rechts, speichere Favoriten und plane deine nächste Watchlist.</p>

      <div class="stats">
        <div class="stat">
          <strong>{$favorites.length}</strong>
          <span>Favoriten</span>
        </div>
        <div class="stat">
          <strong>{$watchlist.length}</strong>
          <span>To Watch</span>
        </div>
      </div>

      <div class="actions">
        <a href="/swipe" class="btn-primary">🔥 Jetzt swipen</a>
        <a href="/favorites" class="btn-ghost">Favoriten</a>
        <a href="/watchlist" class="btn-ghost">Watchlist</a>
      </div>
    </div>
  </div>
</section>

<style>
  /* ── Layout ── */

  .hero {
    position: relative;
    min-height: calc(100vh - 72px);
    background: #09090b;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
  }

  /* ── Background layer ── */

  .bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }

  /* ── Orbs ── */

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    will-change: transform;
  }

  /* Vivid crimson — top-left */
  .orb-1 {
    width: 760px; height: 760px;
    top: -230px; left: -170px;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.72) 0%, rgba(220, 38, 38, 0.38) 45%, transparent 70%);
    animation: drift1 22s ease-in-out infinite;
  }

  /* Deep violet — bottom-right */
  .orb-2 {
    width: 640px; height: 640px;
    bottom: -190px; right: -140px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.68) 0%, rgba(109, 40, 217, 0.32) 45%, transparent 70%);
    animation: drift2 28s ease-in-out infinite;
    animation-delay: -9s;
  }

  /* Magenta / fuchsia — top-right */
  .orb-3 {
    width: 540px; height: 540px;
    top: -130px; right: -90px;
    background: radial-gradient(circle, rgba(217, 70, 239, 0.58) 0%, rgba(192, 38, 211, 0.28) 45%, transparent 70%);
    animation: drift3 34s ease-in-out infinite;
    animation-delay: -16s;
  }

  /* Sky-blue / cyan — bottom-left */
  .orb-4 {
    width: 490px; height: 490px;
    bottom: -110px; left: -90px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.42) 0%, rgba(2, 132, 199, 0.18) 45%, transparent 70%);
    animation: drift4 31s ease-in-out infinite;
    animation-delay: -6s;
  }

  /* Warm rose — drifting centre accent */
  .orb-5 {
    width: 420px; height: 420px;
    top: 33%; left: 36%;
    background: radial-gradient(circle, rgba(251, 113, 133, 0.4) 0%, rgba(244, 63, 94, 0.14) 45%, transparent 70%);
    animation: drift5 40s ease-in-out infinite;
    animation-delay: -22s;
  }

  /* Each drift also breathes (scale) so orbs feel alive */
  @keyframes drift1 {
    0%, 100% { transform: translate(0, 0)          scale(1);    }
    33%       { transform: translate(85px, -75px)   scale(1.12); }
    66%       { transform: translate(-58px, 105px)  scale(0.90); }
  }
  @keyframes drift2 {
    0%, 100% { transform: translate(0, 0)           scale(1);    }
    40%       { transform: translate(-85px, 58px)   scale(1.10); }
    72%       { transform: translate(68px, -95px)   scale(0.92); }
  }
  @keyframes drift3 {
    0%, 100% { transform: translate(0, 0)           scale(1);    }
    50%       { transform: translate(-65px, 75px)   scale(1.08); }
    78%       { transform: translate(45px, -45px)   scale(0.94); }
  }
  @keyframes drift4 {
    0%, 100% { transform: translate(0, 0)           scale(1);    }
    45%       { transform: translate(75px, -55px)   scale(1.10); }
    80%       { transform: translate(-45px, 85px)   scale(0.91); }
  }
  @keyframes drift5 {
    0%, 100% { transform: translate(0, 0)           scale(1);    }
    30%       { transform: translate(-55px, -65px)  scale(1.15); }
    62%       { transform: translate(65px, 45px)    scale(0.88); }
  }

  /* ── Film grain ── */

  .grain {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.05;
    pointer-events: none;
    z-index: 2;
    mix-blend-mode: overlay;
    animation: grain-flicker 0.7s steps(2) infinite;
  }

  @keyframes grain-flicker {
    0%   { opacity: 0.05;  }
    50%  { opacity: 0.038; }
    100% { opacity: 0.055; }
  }

  /* ── Floating poster cards ── */

  .bg-card {
    position: absolute;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: 12px;
    opacity: 0.18;
    filter: blur(1px) brightness(0.58) saturate(0.85);
    animation: float ease-in-out infinite;
    pointer-events: none;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
    will-change: transform;
  }

  @keyframes float {
    0%, 100% { transform: rotate(var(--rot, 0deg)) translateY(0);     }
    50%       { transform: rotate(var(--rot, 0deg)) translateY(-22px); }
  }

  /* ── Vignette ── */

  .vignette {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 72% 72% at 50% 50%,
        transparent 22%,
        rgba(9, 9, 11, 0.68) 58%,
        rgba(9, 9, 11, 0.97) 100%);
    pointer-events: none;
    z-index: 3;
  }

  /* ── Content ── */

  .content {
    position: relative;
    z-index: 4;
    width: 100%;
    max-width: 1120px;
    display: flex;
    align-items: center;
  }

  .hero-card {
    position: relative;
    width: 100%;
    min-height: 540px;
    display: grid;
    align-content: center;
    gap: 0;
    overflow: hidden;
    background: rgba(9, 9, 11, 0.58);
    backdrop-filter: blur(32px) saturate(1.5);
    -webkit-backdrop-filter: blur(32px) saturate(1.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-top-color: rgba(255, 255, 255, 0.16);
    border-radius: 34px;
    padding: clamp(2.5rem, 6vw, 5rem);
    /* Ambient glow — reflects the surrounding orb palette */
    box-shadow:
      0 48px 130px rgba(0, 0, 0, 0.65),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 0  90px rgba(239,  68,  68, 0.10),
      0 0 150px rgba(139,  92, 246, 0.08),
      0 0 200px rgba(217,  70, 239, 0.06);
    animation: rise 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  /* Periodic light-shimmer sweep */
  .hero-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 34px;
    background: linear-gradient(
      108deg,
      transparent 30%,
      rgba(255, 255, 255, 0.035) 50%,
      transparent 70%
    );
    animation: card-shine 14s ease-in-out 1.5s infinite;
    pointer-events: none;
  }

  @keyframes card-shine {
    0%, 38% { transform: translateX(-200%); }
    55%      { transform: translateX(250%);  }
    100%     { transform: translateX(250%);  }
  }

  @keyframes rise {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  /* ── Chip ── */

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    background: rgba(255, 90, 95, 0.12);
    border: 1px solid rgba(255, 90, 95, 0.3);
    color: #ff8a8e;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    width: fit-content;
    margin-bottom: 1.2rem;
    animation: rise 0.6s 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  h1 {
    margin: 0 0 1rem;
    color: #f5f5f5;
    font-size: clamp(3.8rem, 9vw, 8rem);
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -0.03em;
    animation: rise 0.6s 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  p {
    max-width: 680px;
    margin: 0 0 2rem;
    color: #c8c8ca;
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.65;
    animation: rise 0.6s 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  /* ── Stats ── */

  .stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
    animation: rise 0.6s 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .stat {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 18px;
    padding: 1rem 1.5rem;
    min-width: 120px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    transition: background 0.22s, border-color 0.22s, transform 0.22s;
  }

  .stat:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  /* Gradient numbers */
  strong {
    display: block;
    font-size: 2.4rem;
    line-height: 1;
    font-weight: 900;
    margin-bottom: 0.2rem;
    background: linear-gradient(135deg, #ffffff 30%, #ffb3c6 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  span {
    color: #8d8d92;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── Actions ── */

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    animation: rise 0.6s 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .btn-primary,
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.9rem 1.6rem;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.95rem;
    transition:
      transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.22s ease,
      background 0.2s ease;
    white-space: nowrap;
  }

  .btn-primary {
    background: linear-gradient(135deg, #ff5a5f, #e0375e);
    color: #fff;
    box-shadow: 0 16px 40px rgba(255, 90, 95, 0.4), 0 0 0 1px rgba(255, 90, 95, 0.2);
    border: 1px solid transparent;
  }

  .btn-primary:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 24px 55px rgba(255, 90, 95, 0.58), 0 0 0 1px rgba(255, 90, 95, 0.3);
  }

  .btn-ghost {
    background: rgba(255, 255, 255, 0.06);
    color: #d8d8da;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btn-ghost:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.18);
  }

  /* ── Responsive ── */

  @media (max-width: 680px) {
    .hero { padding: 1.25rem 1rem; align-items: flex-start; }
    .hero-card { min-height: auto; border-radius: 26px; }
    .btn-primary, .btn-ghost { width: 100%; }
    .bg-card { opacity: 0.1; }
  }
</style>
