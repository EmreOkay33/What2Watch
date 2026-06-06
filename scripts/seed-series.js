import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://Emre:Marvel.33@cluster0.phxqk8h.mongodb.net/?appName=Cluster0';
const DB_NAME = 'what2watch';

const series = [
  // ── TV Serien ──
  {
    title: 'Breaking Bad',
    year: 2008,
    genre: 'Drama',
    description: 'Ein Chemielehrer erkrankt an Krebs und beginnt Crystal Meth herzustellen, um seine Familie abzusichern.',
    poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    type: 'series'
  },
  {
    title: 'Game of Thrones',
    year: 2011,
    genre: 'Fantasy',
    description: 'Mächtige Adelshäuser kämpfen um den Eisernen Thron und die Herrschaft über die Sieben Königslande.',
    poster: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    type: 'series'
  },
  {
    title: 'Stranger Things',
    year: 2016,
    genre: 'Sci-Fi',
    description: 'In einer Kleinstadt verschwinden Kinder und übernatürliche Kräfte drohen die Welt ins Chaos zu stürzen.',
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    type: 'series'
  },
  {
    title: 'Better Call Saul',
    year: 2015,
    genre: 'Drama',
    description: 'Der gescheiterte Anwalt Jimmy McGill verwandelt sich langsam in den skrupellosen Saul Goodman.',
    poster: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg',
    type: 'series'
  },
  {
    title: 'Dark',
    year: 2017,
    genre: 'Thriller',
    description: 'In einem deutschen Dorf enthüllt das Verschwinden zweier Kinder ein komplexes Zeitreise-Geflecht.',
    poster: 'https://image.tmdb.org/t/p/w500/apbrbWs5M6O5ByWHJjXRRPiX4qM.jpg',
    type: 'series'
  },
  {
    title: 'Sherlock',
    year: 2010,
    genre: 'Krimi',
    description: 'Das legendäre Detektiv-Duo Sherlock Holmes und Watson löst im modernen London spektakuläre Fälle.',
    poster: 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
    type: 'series'
  },
  {
    title: 'The Crown',
    year: 2016,
    genre: 'Drama',
    description: 'Die politischen Rivalitäten und Romanzen, die die Regentschaft von Königin Elizabeth II. prägten.',
    poster: 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg',
    type: 'series'
  },
  {
    title: 'The Last of Us',
    year: 2023,
    genre: 'Drama',
    description: 'In einer postapokalyptischen Welt kämpft ein Schmuggler darum, ein Mädchen über ein verwüstetes Amerika zu bringen.',
    poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    type: 'series'
  },
  {
    title: 'Peaky Blinders',
    year: 2013,
    genre: 'Drama',
    description: 'Die Shelby-Verbrecherfamilie steigt im Birmingham der 1920er-Jahre zu einer mächtigen Unterweltorganisation auf.',
    poster: 'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVn3nyfVS1F.jpg',
    type: 'series'
  },
  {
    title: 'Narcos',
    year: 2015,
    genre: 'Drama',
    description: 'Die wahre Geschichte des Aufstiegs und Falls des kolumbianischen Drogenbosses Pablo Escobar.',
    poster: 'https://image.tmdb.org/t/p/w500/rTmal9fDbwh5F0waol2hq35U4ah.jpg',
    type: 'series'
  },
  {
    title: 'Black Mirror',
    year: 2011,
    genre: 'Sci-Fi',
    description: 'Anthology-Serie mit düsteren Geschichten über die unerwarteten Folgen moderner Technologie.',
    poster: 'https://image.tmdb.org/t/p/w500/7PRddO7z7mcPi21nZTCMGShAyy1.jpg',
    type: 'series'
  },
  {
    title: 'Mindhunter',
    year: 2017,
    genre: 'Thriller',
    description: 'Zwei FBI-Agenten entwickeln in den späten 1970ern die Technik des psychologischen Profiling von Serienmördern.',
    poster: 'https://image.tmdb.org/t/p/w500/6Y5zt7TIrFuXETxsOFR34NGbV92.jpg',
    type: 'series'
  },
  {
    title: 'Succession',
    year: 2018,
    genre: 'Drama',
    description: 'Die dysfunktionale Roy-Familie kämpft um die Kontrolle eines globalen Medienimperiums.',
    poster: 'https://image.tmdb.org/t/p/w500/e2X8og4J2pQsF0RWQzIXmMR5NxF.jpg',
    type: 'series'
  },
  {
    title: 'Chernobyl',
    year: 2019,
    genre: 'Drama',
    description: 'Miniserie über die Katastrophe des Kernkraftwerks Tschernobyl im April 1986 und ihre Folgen.',
    poster: 'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
    type: 'series'
  },
  {
    title: 'Severance',
    year: 2022,
    genre: 'Sci-Fi',
    description: 'Mitarbeiter eines Unternehmens stimmen zu, ihre Erinnerungen an Arbeit und Privatleben chirurgisch zu trennen.',
    poster: 'https://image.tmdb.org/t/p/w500/fR4J24gy2tCBVitu4Wbv6BSQWZA.jpg',
    type: 'series'
  },
  // ── Anime ──
  {
    title: 'Attack on Titan',
    year: 2013,
    genre: 'Anime',
    description: 'Die Menschheit kämpft ums Überleben gegen riesenhafte Kreaturen, die hinter riesigen Mauern eindringen.',
    poster: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    type: 'series'
  },
  {
    title: 'Death Note',
    year: 2006,
    genre: 'Anime',
    description: 'Ein Schüler findet ein übernatürliches Notizbuch, mit dem er jeden töten kann, dessen Namen er hineinschreibt.',
    poster: 'https://image.tmdb.org/t/p/w500/iigJ6gBH7qF4AVumMGCCQBjY0xm.jpg',
    type: 'series'
  },
  {
    title: 'Fullmetal Alchemist: Brotherhood',
    year: 2009,
    genre: 'Anime',
    description: 'Zwei Brüder suchen nach dem Stein der Weisen, um ihre durch Alchemie zerstörten Körper zu restaurieren.',
    poster: 'https://image.tmdb.org/t/p/w500/ynMaBMijy8KBoKxpnTxNzMETaR5.jpg',
    type: 'series'
  },
  {
    title: 'Demon Slayer',
    year: 2019,
    genre: 'Anime',
    description: 'Tanjiro Kamado wird zum Dämonentöter, um seine zur Dämonin verwandelte Schwester zu retten.',
    poster: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
    type: 'series'
  },
  {
    title: 'Cowboy Bebop',
    year: 1998,
    genre: 'Anime',
    description: 'Eine Gruppe von Kopfgeldjägern jagt Kriminellen durch das Sonnensystem — Noir-Sci-Fi mit Jazz-Soundtrack.',
    poster: 'https://image.tmdb.org/t/p/w500/n8V09dDc02KsSN6Q2XI92NiYjOU.jpg',
    type: 'series'
  },
  {
    title: 'Neon Genesis Evangelion',
    year: 1995,
    genre: 'Anime',
    description: 'Teenager steuern riesige Biomaschinen und kämpfen gegen mysteriöse Wesen, während sie mit inneren Dämonen ringen.',
    poster: 'https://image.tmdb.org/t/p/w500/icXcDMFUomzqrp1kT9vHczGxNml.jpg',
    type: 'series'
  },
  {
    title: 'Steins;Gate',
    year: 2011,
    genre: 'Anime',
    description: 'Ein exzentrischer Wissenschaftler erfindet zufällig eine Zeitmaschine und muss mit den Konsequenzen leben.',
    poster: 'https://image.tmdb.org/t/p/w500/45i5YiuWqmZWrk0aRBlNFSBJfOX.jpg',
    type: 'series'
  },
  {
    title: 'One Punch Man',
    year: 2015,
    genre: 'Anime',
    description: 'Ein Superheld, der jeden Gegner mit einem einzigen Schlag besiegen kann, sucht nach einem würdigen Kampf.',
    poster: 'https://image.tmdb.org/t/p/w500/iE3s0lG5QVdEHOEZnoAxjmMtvnR.jpg',
    type: 'series'
  },
  {
    title: 'My Hero Academia',
    year: 2016,
    genre: 'Anime',
    description: 'In einer Welt voller Superhelden kämpft ein machtloser Junge darum, der größte Held aller Zeiten zu werden.',
    poster: 'https://image.tmdb.org/t/p/w500/ivOLM47yJt90P19RH826caBPTEz.jpg',
    type: 'series'
  },
  {
    title: 'Naruto',
    year: 2002,
    genre: 'Anime',
    description: 'Ein junger Ninja mit einem bösen Geist in sich träumt davon, der stärkste Ninja seines Dorfes zu werden.',
    poster: 'https://image.tmdb.org/t/p/w500/xppeysfvDKVx775MFuH8Z9Ex9bQ.jpg',
    type: 'series'
  }
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Verbunden mit MongoDB...');

    const db = client.db(DB_NAME);
    const collection = db.collection('movies');

    // Bestehende Serien löschen (damit kein Duplikat)
    const deleteResult = await collection.deleteMany({ type: 'series' });
    if (deleteResult.deletedCount > 0) {
      console.log(`${deleteResult.deletedCount} bestehende Serien gelöscht.`);
    }

    const result = await collection.insertMany(
      series.map(s => ({ ...s, createdAt: new Date() }))
    );

    console.log(`\n✓ ${result.insertedCount} Serien/Anime erfolgreich eingefügt!\n`);
    series.forEach(s => console.log(`  - ${s.title} (${s.year}) [${s.genre}]`));

  } finally {
    await client.close();
  }
}

seed().catch(console.error);
