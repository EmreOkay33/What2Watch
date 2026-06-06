import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://Emre:Marvel.33@cluster0.phxqk8h.mongodb.net/?appName=Cluster0';
const DB_NAME = 'what2watch';

const movies = [
  {
    title: 'Inception',
    year: 2010,
    genre: 'Sci-Fi',
    description: 'Ein Dieb dringt in die Träume seiner Opfer ein, um Geheimnisse zu stehlen – bis er gebeten wird, eine Idee zu pflanzen.',
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
  },
  {
    title: 'The Dark Knight',
    year: 2008,
    genre: 'Action',
    description: 'Batman stellt sich dem Joker, einem Meister des Chaos, der Gotham City ins Verderben stürzen will.',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
  },
  {
    title: 'Interstellar',
    year: 2014,
    genre: 'Sci-Fi',
    description: 'Eine Gruppe von Astronauten reist durch ein Wurmloch auf der Suche nach einer neuen Heimat für die Menschheit.',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
  },
  {
    title: 'Parasite',
    year: 2019,
    genre: 'Thriller',
    description: 'Eine verarmte Familie schleicht sich geschickt in den Alltag einer wohlhabenden Großbürgerfamilie ein.',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'
  },
  {
    title: 'Pulp Fiction',
    year: 1994,
    genre: 'Crime',
    description: 'Mehrere Kriminellen-Geschichten verknüpfen sich auf unerwartete Weise im Los Angeles der 90er.',
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'
  },
  {
    title: 'The Shawshank Redemption',
    year: 1994,
    genre: 'Drama',
    description: 'Ein zu Unrecht verurteilter Bankier findet im Gefängnis Shawshank Freundschaft und Hoffnung.',
    poster: 'https://image.tmdb.org/t/p/w500/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg'
  },
  {
    title: 'The Godfather',
    year: 1972,
    genre: 'Crime',
    description: 'Der alternde Patriarch der Corleone-Mafia-Dynastie übergibt die Kontrolle seines Imperiums an seinen zögerlichen Sohn.',
    poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLegHnDmni3S.jpg'
  },
  {
    title: 'Fight Club',
    year: 1999,
    genre: 'Drama',
    description: 'Ein schlafloser Büroangestellter und ein windiger Seifenverkäufer gründen einen Untergrundkampfclub.',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'
  },
  {
    title: 'Forrest Gump',
    year: 1994,
    genre: 'Drama',
    description: 'Das Leben eines Mannes mit niedrigem IQ, der ungewollt an den größten Ereignissen der US-Geschichte teilnimmt.',
    poster: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg'
  },
  {
    title: 'The Matrix',
    year: 1999,
    genre: 'Sci-Fi',
    description: 'Ein Hacker entdeckt, dass die Welt, in der er lebt, eine Simulation ist, und kämpft gegen die Maschinen.',
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg'
  },
  {
    title: 'Goodfellas',
    year: 1990,
    genre: 'Crime',
    description: 'Die wahre Geschichte des Aufstiegs und Falls eines New Yorker Mafiamitglieds über drei Jahrzehnte.',
    poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg'
  },
  {
    title: 'Schindler\'s List',
    year: 1993,
    genre: 'Drama',
    description: 'Der deutsche Unternehmer Oskar Schindler rettet über tausend jüdische Flüchtlinge vor dem Holocaust.',
    poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg'
  },
  {
    title: 'The Silence of the Lambs',
    year: 1991,
    genre: 'Thriller',
    description: 'Eine FBI-Agentin muss den inhaftierten Kannibalen Hannibal Lecter um Hilfe bei der Jagd auf einen Serienkiller bitten.',
    poster: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg'
  },
  {
    title: 'Se7en',
    year: 1995,
    genre: 'Thriller',
    description: 'Zwei Detektive jagen einen Serienkiller, der seine Morde nach den sieben Todsünden inszeniert.',
    poster: 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVnS.jpg'
  },
  {
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    year: 2001,
    genre: 'Fantasy',
    description: 'Der Hobbit Frodo macht sich mit Gefährten auf, den mächtigen Ring der Macht ins Feuer des Schicksalsbergs zu werfen.',
    poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg'
  },
  {
    title: 'Gladiator',
    year: 2000,
    genre: 'Action',
    description: 'Ein einst mächtiger römischer General wird zum Sklaven und kämpft sich als Gladiator zurück zur Macht.',
    poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg'
  },
  {
    title: 'The Departed',
    year: 2006,
    genre: 'Crime',
    description: 'Ein verdeckter Ermittler in der irischen Mob und ein Maulwurf der Polizei suchen beide nach dem jeweils anderen.',
    poster: 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg'
  },
  {
    title: 'Whiplash',
    year: 2014,
    genre: 'Drama',
    description: 'Ein junger Schlagzeugstudent gerät unter die Fittiche eines besessenen Dirigenten, der ihn auf die äußerste Probe stellt.',
    poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg'
  },
  {
    title: 'Oppenheimer',
    year: 2023,
    genre: 'Drama',
    description: 'Die Geschichte des theoretischen Physikers J. Robert Oppenheimer und seiner Rolle bei der Entwicklung der Atombombe.',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'
  },
  {
    title: 'Dune',
    year: 2021,
    genre: 'Sci-Fi',
    description: 'Paul Atreides führt nomadische Stämme in einem epischen Kampf um die wertvollste Ressource des Universums.',
    poster: 'https://image.tmdb.org/t/p/w500/d5NXSklpcvksqnGBdx1c7ZnKvSZ.jpg'
  },
  {
    title: 'Everything Everywhere All at Once',
    year: 2022,
    genre: 'Sci-Fi',
    description: 'Eine Chinesisch-Amerikanerin muss das Multiversum retten, während sie ihre Steuererklärung macht.',
    poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg'
  },
  {
    title: 'No Country for Old Men',
    year: 2007,
    genre: 'Thriller',
    description: 'Ein Jäger findet Drogen und Geld von einem missglückten Drogenhandel und wird vom psychopathischen Killer Chigurh verfolgt.',
    poster: 'https://image.tmdb.org/t/p/w500/6d3vRCbLpMLRTZI6IWMfbkE9UeH.jpg'
  },
  {
    title: 'Spirited Away',
    year: 2001,
    genre: 'Animation',
    description: 'Ein zehnjähriges Mädchen gerät in eine Geisterwelt und muss sich ihren Weg zurück in die Menschenwelt erkämpfen.',
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg'
  },
  {
    title: 'Amélie',
    year: 2001,
    genre: 'Romanze',
    description: 'Eine schüchterne Kellnerin in Paris beschließt, anderen Menschen heimlich Gutes zu tun – und findet dabei selbst die Liebe.',
    poster: 'https://image.tmdb.org/t/p/w500/wQ6kP7RqePiWRqz5TZ9mSUYqPgP.jpg'
  },
  {
    title: 'The Grand Budapest Hotel',
    year: 2014,
    genre: 'Komödie',
    description: 'Die Abenteuer des legendären Concierge Gustave H. und seines treuen Gepäckträgers Zero in einem europäischen Luxushotel.',
    poster: 'https://image.tmdb.org/t/p/w500/eWDzbmEAvZqGnTSZp4y40yYYhIQ.jpg'
  }
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Verbunden mit MongoDB...');

    const db = client.db(DB_NAME);
    const collection = db.collection('movies');

    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`Es gibt bereits ${existingCount} Filme in der Datenbank.`);
      console.log('Lösche bestehende Filme und füge neue ein...');
      await collection.deleteMany({});
    }

    const result = await collection.insertMany(
      movies.map(m => ({ ...m, createdAt: new Date() }))
    );

    console.log(`\n✓ ${result.insertedCount} Filme erfolgreich eingefügt!\n`);
    movies.forEach(m => console.log(`  - ${m.title} (${m.year}) [${m.genre}]`));

  } finally {
    await client.close();
  }
}

seed().catch(console.error);
