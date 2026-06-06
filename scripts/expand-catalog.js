import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://Emre:Marvel.33@cluster0.phxqk8h.mongodb.net/?appName=Cluster0';
const DB_NAME     = 'what2watch';
const TMDB_KEY    = 'a6548c65e8d0ea387519c9db3ce3de82';
const BASE        = 'https://api.themoviedb.org/3';
const IMG         = 'https://image.tmdb.org/t/p/w500';

async function getPoster(title, year, type) {
  try {
    const isMovie  = type !== 'series';
    const ep       = isMovie ? '/search/movie' : '/search/tv';
    const yearKey  = isMovie ? 'year' : 'first_air_date_year';

    for (const extra of [`&${yearKey}=${year}`, '']) {
      const url = `${BASE}${ep}?api_key=${TMDB_KEY}&language=de-DE&query=${encodeURIComponent(title)}${extra}`;
      const r = await fetch(url);
      const d = await r.json();
      if (d.results?.[0]?.poster_path) return `${IMG}${d.results[0].poster_path}`;
    }
    return null;
  } catch { return null; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Neue Filme ────────────────────────────────────────────────────────────────
const newMovies = [
  { title: 'Avengers: Endgame',                year: 2019, genre: 'Action',    description: 'Die Avengers unternehmen einen letzten verzweifelten Versuch, Thanos zu besiegen und die Auslöschung rückgängig zu machen.' },
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018, genre: 'Animation', description: 'Miles Morales wird zum Spider-Man und trifft auf Versionen des Helden aus verschiedenen Universen des Multiversums.' },
  { title: 'The Wolf of Wall Street',           year: 2013, genre: 'Crime',     description: 'Der Aufstieg und Fall von Jordan Belfort, einem New Yorker Börsenmakler, der mit Betrug ein Vermögen anhäufte.' },
  { title: 'Mad Max: Fury Road',                year: 2015, genre: 'Action',    description: 'In einer postapokalyptischen Wüste flüchten Max und Furiosa mit einem Tankwagen vor dem tyrannischen Immortan Joe.' },
  { title: 'The Social Network',                year: 2010, genre: 'Drama',     description: 'Die Geschichte der Gründung von Facebook und der rechtlichen Auseinandersetzungen, die Mark Zuckerberg begleiteten.' },
  { title: 'Blade Runner 2049',                 year: 2017, genre: 'Sci-Fi',    description: 'Ein Blade Runner entdeckt ein Geheimnis, das die Gesellschaft erschüttern könnte, und macht sich auf die Suche nach Rick Deckard.' },
  { title: 'La La Land',                        year: 2016, genre: 'Romanze',   description: 'In Los Angeles verlieben sich eine Schauspielerin und ein Jazzmusiker – doch ihre Träume stellen ihre Beziehung auf die Probe.' },
  { title: 'Black Swan',                        year: 2010, genre: 'Thriller',  description: 'Eine New Yorker Balletttänzerin verliert sich in der Doppelrolle des Schwanensees und gleitet in den Wahnsinn.' },
  { title: 'Joker',                             year: 2019, genre: 'Drama',     description: 'Der gescheiterte Comedian Arthur Fleck verwandelt sich in Gothams chaotischen Kriminellen, den Joker.' },
  { title: 'Get Out',                           year: 2017, genre: 'Horror',    description: 'Ein afroamerikanischer Mann besucht die Familie seiner weißen Freundin und entdeckt eine erschreckende Verschwörung.' },
  { title: 'A Quiet Place',                     year: 2018, genre: 'Horror',    description: 'Eine Familie kämpft ums Überleben in einer Welt, die von Kreaturen heimgesucht wird, die auf Geräusche reagieren.' },
  { title: 'Hereditary',                        year: 2018, genre: 'Horror',    description: 'Nach dem Tod der Großmutter bröckelt die Familie Annie, als dunkle Familiengeheimnisse und übernatürliche Kräfte ans Licht kommen.' },
  { title: 'The Revenant',                      year: 2015, genre: 'Action',    description: 'Der Trapper Hugh Glass kämpft ums Überleben in der Wildnis und sinnt nach Rache an denen, die ihn für tot zurückließen.' },
  { title: 'Gone Girl',                         year: 2014, genre: 'Thriller',  description: 'Als Amy Dunne verschwindet, gerät ihr Ehemann Nick unter Verdacht – doch die Wahrheit ist viel komplexer.' },
  { title: 'Prisoners',                         year: 2013, genre: 'Thriller',  description: 'Als zwei kleine Mädchen verschwinden, beginnt ein verzweifelter Vater eine eigene Suche – mit gefährlichen Konsequenzen.' },
  { title: 'Arrival',                           year: 2016, genre: 'Sci-Fi',    description: 'Eine Linguistin wird beauftragt, mit mysteriösen Aliens zu kommunizieren, die auf der Erde gelandet sind.' },
  { title: 'Top Gun: Maverick',                 year: 2022, genre: 'Action',    description: 'Pete "Maverick" Mitchell muss eine Gruppe von Top-Gun-Absolventen für eine nahezu unmögliche Mission ausbilden.' },
  { title: 'Knives Out',                        year: 2019, genre: 'Krimi',     description: 'Nach dem Tod des Patriarchen der Thrombey-Familie untersucht Detektiv Benoit Blanc den mysteriösen Fall.' },
  { title: 'The Menu',                          year: 2022, genre: 'Thriller',  description: 'Eine Gruppe wohlhabender Gäste besucht ein abgelegenes Insel-Restaurant – und der Chef hat etwas Schockierendes geplant.' },
  { title: 'Dune: Part Two',                    year: 2024, genre: 'Sci-Fi',    description: 'Paul Atreides verbündet sich mit den Fremen, während er seinen Rachefeldzug gegen die Verschwörer seines Vaters führt.' },
  { title: 'Poor Things',                       year: 2023, genre: 'Drama',     description: 'Bella Baxter, mit dem Gehirn eines Kindes im Körper einer Frau, erkundet die Welt auf ihrer ungewöhnlichen Reise.' },
  { title: 'All Quiet on the Western Front',    year: 2022, genre: 'Drama',     description: 'Ein junger Deutscher kämpft im Ersten Weltkrieg und erlebt hautnah die brutale Sinnlosigkeit des Krieges.' },
  { title: 'Glass Onion',                       year: 2022, genre: 'Krimi',     description: 'Detektiv Benoit Blanc wird zu einem Rätselmörder-Spiel auf einer privaten Insel eingeladen – und ein echter Mord geschieht.' },
  { title: 'The Batman',                        year: 2022, genre: 'Action',    description: 'In seinem zweiten Jahr als Batman deckt Bruce Wayne eine Korruption in Gotham auf, während er den Riddler jagt.' },
  { title: 'Nope',                              year: 2022, genre: 'Horror',    description: 'Geschwister auf einer Pferderanch in Kalifornien begegnen einem mysteriösen, scheinbar außerirdischen Phänomen.' },
  { title: 'The Northman',                      year: 2022, genre: 'Action',    description: 'Ein Wikinger-Prinz sucht Rache für den Mord an seinem Vater in dieser epischen nordischen Rachesaga.' },
  { title: 'RRR',                               year: 2022, genre: 'Action',    description: 'Zwei legendäre indische Freiheitskämpfer verbünden sich in einer epischen Geschichte über Freundschaft und Rebellion.' },
  { title: 'Tenet',                             year: 2020, genre: 'Sci-Fi',    description: 'Ein namenloser Protagonist navigiert durch die Welt der internationalen Spionage mit einer invertierten Zeitmanipulation.' },
  { title: '1917',                              year: 2019, genre: 'Drama',     description: 'Zwei britische Soldaten erhalten einen gefährlichen Auftrag: Sie müssen eine lebenswichtige Nachricht durch Feindesgebiet überbringen.' },
  { title: 'Once Upon a Time in Hollywood',     year: 2019, genre: 'Komödie',   description: 'Ein alternder TV-Star und sein Stuntman erleben das Ende der goldenen Hollywood-Ära im Los Angeles von 1969.' },
  { title: 'Midsommar',                         year: 2019, genre: 'Horror',    description: 'Eine Gruppe junger Amerikaner besucht ein schwedisches Mittsommerfestival und entdeckt ein dunkles Geheimnis.' },
  { title: 'Uncut Gems',                        year: 2019, genre: 'Thriller',  description: 'Ein New Yorker Juwelier mit Spielsucht setzt alles auf einen riskanten Wett-Stein mit einem NBA-Star.' },
  { title: 'Furiosa: A Mad Max Saga',           year: 2024, genre: 'Action',    description: 'Die Ursprungsgeschichte von Furiosa – wie sie von Immortan Joe entführt wird und ihren Weg nach Hause sucht.' },
  { title: 'Inside Out 2',                      year: 2024, genre: 'Animation', description: 'Riley ist jetzt Teenager und neue Emotionen, darunter Angst und Neid, stoßen zu den bisherigen ins Kontrollzentrum.' },
  { title: 'Deadpool & Wolverine',              year: 2024, genre: 'Action',    description: 'Wade Wilson reist durch das Multiversum und schleppt einen widerwilligen Wolverine in ein abenteuerliches Abenteuer.' },
  { title: 'Past Lives',                        year: 2023, genre: 'Romanze',   description: 'Zwei Kindheitsfreunde aus Seoul treffen sich Jahrzehnte später in New York wieder und fragen sich, was hätte sein können.' },
  { title: 'Killers of the Flower Moon',        year: 2023, genre: 'Drama',     description: 'In den 1920er Jahren werden Mitglieder der Osage-Nation nach der Entdeckung von Öl auf ihrem Land systematisch ermordet.' },
  { title: 'Barbie',                            year: 2023, genre: 'Komödie',   description: 'Barbie verlässt das perfekte Barbieland und reist in die echte Welt, wo sie eine überraschende Entdeckung macht.' },
  { title: 'Saltburn',                          year: 2023, genre: 'Thriller',  description: 'Ein Student aus einfachen Verhältnissen wird für die Sommerferien auf das prächtige Anwesen seines reichen Kommilitonen eingeladen.' },
  { title: 'Spider-Man: Across the Spider-Verse', year: 2023, genre: 'Animation', description: 'Miles Morales reist durch das Multiversum und begegnet einem Team von Spider-Menschen, die eine neue Bedrohung bekämpfen.' },
  { title: 'John Wick: Chapter 4',              year: 2023, genre: 'Action',    description: 'John Wick kämpft gegen den mächtigen High Table und sucht einen Weg, seine Freiheit zu erkaufen.' },
  { title: 'The Iron Claw',                     year: 2023, genre: 'Drama',     description: 'Die tragische Geschichte der Von-Erich-Wrestling-Dynastie und der Fluch, der über der Familie zu hängen scheint.' },
];

// ── Neue Serien & Anime ───────────────────────────────────────────────────────
const newSeries = [
  // TV Serien
  { title: 'The Wire',                  year: 2002, genre: 'Drama',     description: 'Eine epische, realistische Darstellung des Drogenhandels und der Polizeiarbeit in Baltimore.' },
  { title: 'The Sopranos',              year: 1999, genre: 'Drama',     description: 'Mafioso Tony Soprano balanciert sein Familienleben in New Jersey mit seiner Rolle als Gangster-Boss.' },
  { title: 'True Detective',            year: 2014, genre: 'Thriller',  description: 'Zwei Detektive mit gegensätzlichen Weltanschauungen jagen über 17 Jahre einen Serienmörder in Louisiana.' },
  { title: 'Westworld',                 year: 2016, genre: 'Sci-Fi',    description: 'In einem Freizeitpark mit lebensechten KI-Robotern erwacht eines der Hosts zum Bewusstsein.' },
  { title: 'Ozark',                     year: 2017, genre: 'Drama',     description: 'Ein Finanzberater muss seine Familie nach Missouri verlegen, nachdem er für ein Drogenkartell Geld waschen muss.' },
  { title: 'Squid Game',                year: 2021, genre: 'Thriller',  description: 'Verzweifelte Schuldner nehmen an tödlichen Kinderspielen teil, bei denen der Gewinner ein enormes Preisgeld erhält.' },
  { title: 'Arcane',                    year: 2021, genre: 'Animation', description: 'In den Städten Piltover und Zaun spielen sich die Ursprungsgeschichten von Vi und Jinx ab – animiertes Meisterwerk.' },
  { title: 'The Boys',                  year: 2019, genre: 'Action',    description: 'Eine Gruppe von Vigilanten bekämpft korrupte Superhelden, die von einem mächtigen Konzern kontrolliert werden.' },
  { title: 'Invincible',                year: 2021, genre: 'Animation', description: 'Der Sohn des mächtigsten Superhelden der Erde entwickelt eigene Kräfte – und entdeckt erschreckende Wahrheiten über seinen Vater.' },
  { title: 'Ted Lasso',                 year: 2020, genre: 'Komödie',   description: 'Ein optimistischer amerikanischer Football-Trainer übernimmt überraschend ein englisches Premier-League-Team.' },
  { title: 'The Mandalorian',           year: 2019, genre: 'Sci-Fi',    description: 'Ein einsamer Mandalorian-Kopfgeldjäger schützt nach den Ereignissen des Galaktischen Imperiums ein rätselhaftes Kind.' },
  { title: 'House of the Dragon',       year: 2022, genre: 'Fantasy',   description: 'Der innere Konflikt der Targaryens führt zum Bürgerkrieg "Tanz der Drachen" – das Prequel zu Game of Thrones.' },
  { title: 'Wednesday',                 year: 2022, genre: 'Horror',    description: 'Wednesday Addams besucht die Nevermore Academy und muss dort sowohl ihre Mitschüler als auch ein übernatürliches Monster aufhalten.' },
  { title: 'Euphoria',                  year: 2019, genre: 'Drama',     description: 'Teenager in einer amerikanischen Kleinstadt kämpfen mit Sucht, Trauma, Identität und Beziehungen.' },
  { title: 'Fleabag',                   year: 2016, genre: 'Komödie',   description: 'Eine witzige, selbstzerstörerische Frau in London navigiert durch Trauer, Familie und Liebesbeziehungen.' },
  { title: 'The White Lotus',           year: 2021, genre: 'Drama',     description: 'Eine Anthologie über Gäste und Personal eines Luxusresorts, deren dunkle Geheimnisse langsam ans Licht kommen.' },
  { title: 'Barry',                     year: 2018, genre: 'Komödie',   description: 'Ein Auftragskiller aus dem Mittleren Westen entdeckt in Los Angeles eine Leidenschaft fürs Schauspielern.' },
  { title: 'Only Murders in the Building', year: 2021, genre: 'Krimi', description: 'Drei Nachbarn beginnen einen True-Crime-Podcast, nachdem in ihrem New Yorker Apartment ein Mord geschieht.' },
  { title: 'Mr. Robot',                 year: 2015, genre: 'Thriller',  description: 'Ein brillanter, aber sozial isolierter Hacker wird von einer anonymen Gruppe rekrutiert, um das Finanzsystem zu sabotieren.' },
  { title: 'Andor',                     year: 2022, genre: 'Sci-Fi',    description: 'Die Entstehungsgeschichte von Cassian Andor und den Anfängen des Widerstands gegen das Galaktische Imperium.' },
  { title: 'The Bear',                  year: 2022, genre: 'Drama',     description: 'Ein Star-Koch kehrt nach Chicago zurück, um das Sandwich-Restaurant seiner Familie zu übernehmen und zu modernisieren.' },
  { title: 'Station Eleven',            year: 2021, genre: 'Sci-Fi',    description: 'Zwanzig Jahre nach einer tödlichen Grippepandemie kämpft eine Wandertheatergruppe ums Überleben in der neuen Welt.' },
  { title: 'Yellowstone',               year: 2018, genre: 'Drama',     description: 'Die Dutton-Familie kämpft um die Kontrolle über die größte zusammenhängende Ranch Nordamerikas.' },
  { title: 'Money Heist',               year: 2017, genre: 'Krimi',     description: 'Ein genialer Mastermind und seine Bande überfallen die spanische Münzanstalt in einer minutiös geplanten Aktion.' },
  { title: 'Killing Eve',               year: 2018, genre: 'Thriller',  description: 'Eine MI5-Agentin und eine psychopathische Auftragskillerin werden voneinander besessen.' },
  { title: 'The Witcher',               year: 2019, genre: 'Fantasy',   description: 'Hexer Geralt von Riva, eine Magierschülerin und eine Königstochter kämpfen gemeinsam in einer sich verändernden Welt.' },
  { title: 'Loki',                      year: 2021, genre: 'Sci-Fi',    description: 'Der Gott des Schabernacks wird von der mysteriösen TVA gezwungen, Varianten seiner selbst in verschiedenen Zeitlinien zu jagen.' },
  { title: 'Cobra Kai',                 year: 2018, genre: 'Action',    description: '34 Jahre nach dem All-Valley-Turnier treffen Johnny Lawrence und Daniel LaRusso erneut aufeinander.' },
  { title: 'Lupin',                     year: 2021, genre: 'Krimi',     description: 'Inspiriert von Arsène Lupin rächt Assane Diop seinen Vater an einer mächtigen Pariser Familie.' },
  { title: 'Foundation',                year: 2021, genre: 'Sci-Fi',    description: 'Mathematiker Hari Seldon sagt den Fall des Galaktischen Imperiums voraus und gründet eine Gemeinschaft, um das Wissen zu bewahren.' },
  // Anime
  { title: 'Jujutsu Kaisen',            year: 2020, genre: 'Anime',     description: 'Schüler Yuji Itadori schluckt einen verfluchten Gegenstand und wird zum Körper des mächtigsten Fluches – einem Jujutsu-Zauberer.' },
  { title: 'Chainsaw Man',              year: 2022, genre: 'Anime',     description: 'Denji fusioniert mit seinem Teufelshund zu Chainsaw Man und kämpft für die Teufelsjäger-Organisation.' },
  { title: 'Spy x Family',              year: 2022, genre: 'Anime',     description: 'Ein Geheimagent gründet eine Scheinfamilie – eine Attentäterin als Ehefrau und ein telepathisches Kind als Tochter.' },
  { title: 'Vinland Saga',              year: 2019, genre: 'Anime',     description: 'Der junge Thorfinn sucht Rache für den Tod seines Vaters und kämpft sich als Wikinger durch die brutale Welt des Nordens.' },
  { title: 'Mob Psycho 100',            year: 2016, genre: 'Anime',     description: 'Der überwältigend mächtige Esper Shigeo "Mob" Kageyama versucht, ein normales Leben zu führen, während seine Kräfte explodieren.' },
  { title: 'Hunter x Hunter',           year: 2011, genre: 'Anime',     description: 'Gon Freecss verlässt seine Insel, um seinen Vater zu finden – einen der besten Hunter der Welt.' },
  { title: 'One Piece',                 year: 1999, genre: 'Anime',     description: 'Monkey D. Ruffy und seine Piratenbande suchen den legendären One Piece-Schatz, um König der Piraten zu werden.' },
  { title: "JoJo's Bizarre Adventure",  year: 2012, genre: 'Anime',     description: 'Die übernatürlichen Abenteuer der Joestar-Familie über Generationen hinweg, geprägt von ikonischen Posen und dramatischen Kämpfen.' },
  { title: 'Code Geass',                year: 2006, genre: 'Anime',     description: 'Prinz Lelouch erhält die Macht der "Geass" und führt einen Widerstand gegen das Britannische Imperium an.' },
  { title: 'Violet Evergarden',         year: 2018, genre: 'Anime',     description: 'Die ehemalige Kindersoldatin Violet beginnt als Briefschreiberin zu arbeiten und lernt, menschliche Emotionen zu verstehen.' },
  { title: 'Haikyuu!!',                 year: 2014, genre: 'Anime',     description: 'Der kleine Shoyo Hinata kämpft sich trotz seiner Körpergröße ins Volleyball-Team und zum Wettkampf auf höchstem Niveau.' },
  { title: 'Your Lie in April',         year: 2014, genre: 'Anime',     description: 'Ein ehemaliges Klavier-Wunderkind trifft auf eine lebhafte Geigerin, die seine Welt und seine Musik neu zum Klingen bringt.' },
  { title: 'Re:Zero',                   year: 2016, genre: 'Anime',     description: 'Subaru Natsuki wird in eine Fantasiewelt versetzt und entdeckt, dass er nach dem Tod in der Zeit zurückgeworfen wird.' },
  { title: 'Dragon Ball Z',             year: 1989, genre: 'Anime',     description: 'Son Goku und seine Freunde verteidigen die Erde gegen immer mächtigere Feinde in epischen Kämpfen.' },
  { title: 'Bleach',                    year: 2004, genre: 'Anime',     description: 'Ichigo Kurosaki erhält die Kräfte eines Shinigami und kämpft gegen böse Geister, um die Welt der Lebenden zu schützen.' },
  { title: 'Tokyo Ghoul',               year: 2014, genre: 'Anime',     description: 'Ken Kaneki überlebt einen Angriff eines Ghouls und wird halb Ghoul – zerrissen zwischen zwei Welten.' },
  { title: 'Sword Art Online',          year: 2012, genre: 'Anime',     description: 'Spieler werden in einem virtuellen MMORPG eingesperrt – wer dort stirbt, stirbt auch im echten Leben.' },
];

async function run() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✔ MongoDB verbunden\n');
    const col = client.db(DB_NAME).collection('movies');

    // ── 1. type:'movie' für Einträge ohne type setzen ──────────────────────────
    const missingType = await col.countDocuments({ type: { $exists: false } });
    if (missingType > 0) {
      await col.updateMany({ type: { $exists: false } }, { $set: { type: 'movie' } });
      console.log(`✔ type:'movie' für ${missingType} bestehende Filme gesetzt\n`);
    }

    // ── 2. Fehlende Poster für bestehende Einträge holen ──────────────────────
    const noPosters = await col.find({ $or: [{ poster: '' }, { poster: { $exists: false } }, { poster: /^https:\/\/picsum/ }] }).toArray();
    if (noPosters.length > 0) {
      console.log(`Poster-Fix: ${noPosters.length} Einträge ohne/mit Platzhalter-Poster...\n`);
      for (const doc of noPosters) {
        const poster = await getPoster(doc.title, doc.year, doc.type ?? 'movie');
        if (poster) {
          await col.updateOne({ _id: doc._id }, { $set: { poster } });
          console.log(`  📷 ${doc.title}`);
        } else {
          console.log(`  ✗  ${doc.title} — kein Poster gefunden`);
        }
        await delay(200);
      }
      console.log();
    }

    // ── 3. Neue Filme einfügen ─────────────────────────────────────────────────
    console.log('Neue Filme hinzufügen...\n');
    let addedMovies = 0, skippedMovies = 0;
    for (const m of newMovies) {
      const exists = await col.findOne({ title: m.title, year: m.year });
      if (exists) { skippedMovies++; continue; }
      const poster = await getPoster(m.title, m.year, 'movie');
      await col.insertOne({ ...m, type: 'movie', poster: poster || '', createdAt: new Date() });
      console.log(`  ✓ ${m.title} (${m.year})`);
      addedMovies++;
      await delay(220);
    }
    console.log(`\n${addedMovies} neue Filme eingefügt, ${skippedMovies} übersprungen.\n`);

    // ── 4. Neue Serien/Anime einfügen ──────────────────────────────────────────
    console.log('Neue Serien & Anime hinzufügen...\n');
    let addedSeries = 0, skippedSeries = 0;
    for (const s of newSeries) {
      const exists = await col.findOne({ title: s.title, year: s.year });
      if (exists) { skippedSeries++; continue; }
      const poster = await getPoster(s.title, s.year, 'series');
      await col.insertOne({ ...s, type: 'series', poster: poster || '', createdAt: new Date() });
      console.log(`  ✓ ${s.title} (${s.year})`);
      addedSeries++;
      await delay(220);
    }
    console.log(`\n${addedSeries} neue Serien/Anime eingefügt, ${skippedSeries} übersprungen.\n`);

    const total = await col.countDocuments();
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Gesamt in DB: ${total} Einträge`);

  } finally {
    await client.close();
  }
}

run().catch(console.error);
