import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, '..', 'zahiiba.sqlite')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id        TEXT PRIMARY KEY,
    label_en  TEXT NOT NULL,
    label_fi  TEXT NOT NULL,
    label_so  TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS dishes (
    id                   TEXT PRIMARY KEY,
    name_en              TEXT NOT NULL,
    name_fi              TEXT NOT NULL,
    name_so              TEXT NOT NULL,
    subtitle_en          TEXT NOT NULL DEFAULT '',
    subtitle_fi          TEXT NOT NULL DEFAULT '',
    subtitle_so          TEXT NOT NULL DEFAULT '',
    description_en       TEXT NOT NULL DEFAULT '',
    description_fi       TEXT NOT NULL DEFAULT '',
    description_so       TEXT NOT NULL DEFAULT '',
    long_description_en  TEXT NOT NULL DEFAULT '',
    long_description_fi  TEXT NOT NULL DEFAULT '',
    long_description_so  TEXT NOT NULL DEFAULT '',
    price                REAL NOT NULL,
    category             TEXT NOT NULL,
    image_url            TEXT NOT NULL DEFAULT '',
    is_popular           INTEGER NOT NULL DEFAULT 0,
    in_stock             INTEGER NOT NULL DEFAULT 1,
    ingredients          TEXT NOT NULL DEFAULT '{"EN":[],"FI":[],"SO":[]}',
    allergens            TEXT NOT NULL DEFAULT '[]',
    meta                 TEXT NOT NULL DEFAULT '{}',
    sort_order           INTEGER NOT NULL DEFAULT 0,
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category) REFERENCES categories(id)
  );
`)

// ── Seed helper ──────────────────────────────────────────────────────────────
function rowToDish(row) {
  return {
    id: row.id,
    name:            { EN: row.name_en,             FI: row.name_fi,             SO: row.name_so },
    subtitle:        { EN: row.subtitle_en,          FI: row.subtitle_fi,         SO: row.subtitle_so },
    description:     { EN: row.description_en,       FI: row.description_fi,      SO: row.description_so },
    longDescription: { EN: row.long_description_en,  FI: row.long_description_fi, SO: row.long_description_so },
    price:       row.price,
    category:    row.category,
    image:       row.image_url,
    isPopular:   row.is_popular  === 1,
    inStock:     row.in_stock    === 1,
    ingredients: JSON.parse(row.ingredients),
    allergens:   JSON.parse(row.allergens),
    meta:        JSON.parse(row.meta),
    sortOrder:   row.sort_order,
    createdAt:   row.created_at,
  }
}

// ── Seed data ────────────────────────────────────────────────────────────────
const seedCategories = [
  { id: 'food',        label_en: 'Food',        label_fi: 'Ruoka',          label_so: 'Cunto',           sort_order: 0 },
  { id: 'pastry',      label_en: 'Pastry',      label_fi: 'Leivonnaiset',   label_so: 'Rooti',           sort_order: 1 },
  { id: 'desserts',    label_en: 'Desserts',    label_fi: 'Jälkiruoat',     label_so: 'Macmacaan',       sort_order: 2 },
  { id: 'warm-drinks', label_en: 'Warm Drinks', label_fi: 'Kuumat juomat',  label_so: 'Cabitaan kulul',  sort_order: 3 },
  { id: 'cold-drinks', label_en: 'Cold Drinks', label_fi: 'Kylmät juomat', label_so: 'Cabitaano qabow', sort_order: 4 },
]

const seedDishes = [
  {
    id: 'suqaar-sabaayad',
    name_en: 'Suqaar iyo Sabaayad', name_fi: 'Suqaar ja Sabaayad', name_so: 'Suqaar iyo Sabaayad',
    subtitle_en: 'Sautéed beef · peppers · Somali flatbread',
    subtitle_fi: 'Paistettua naudanlihaa · paprikaa · somalialaista leipää',
    subtitle_so: 'Hilib suqaar · basbaas · sabaayad Soomaaliyeed',
    description_en: 'Crisp sabaayad, sautéed spiced beef.',
    description_fi: 'Rapea sabaayad, mausteinen naudanliha.',
    description_so: 'Sabaayad qallafsan, hilib shiidan.',
    long_description_en: 'Tender strips of beef suqaar wok-tossed with onion, capsicum and xawaash spice, folded into warm hand-rolled sabaayad — a Zahiiba house favourite.',
    long_description_fi: 'Mureita naudanlihasuikaleita paistettuna sipulin, paprikan ja xawaash-mausteen kera, käärittynä lämpimään käsintehtyyn sabaayadiin — Zahiiban suosikki.',
    long_description_so: 'Hilib suqaar oo khafiif ah oo lagu shiilay basaal, basal iyo xawaash, oo lagu duudduubay sabaayad gacanta lagu sameeyay — kan ugu caansan Zahiiba.',
    price: 11.00, category: 'food', image_url: '/images/suqaar.png', is_popular: 1, in_stock: 1,
    ingredients: JSON.stringify({ EN: ['Beef','Xawaash','Capsicum','Onion','Sabaayad'], FI: ['Naudanliha','Xawaash','Paprika','Sipuli','Sabaayad'], SO: ['Hilibka','Xawaash','Basbaas','Basal','Sabaayad'] }),
    allergens: JSON.stringify([
      { label: { EN: 'Gluten (wheat)', FI: 'Gluteeni (vehnä)', SO: 'Gluten (qamadi)' }, color: 'wheat' },
      { label: { EN: 'Cooked in shared kitchen', FI: 'Jaettu keittiö', SO: 'Jiko la wadaago' }, color: 'shared' },
    ]),
    meta: JSON.stringify({ halal: true, spice: { EN: 'Medium spice', FI: 'Keskivahva', SO: 'Dhexdhexaad' }, serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' } }),
    sort_order: 0,
  },
  {
    id: 'hilib-ari',
    name_en: 'Hilib Ari', name_fi: 'Hilib Ari (Vuohenlihaa)', name_so: 'Hilib Ari',
    subtitle_en: 'Grilled goat · rice · salad',
    subtitle_fi: 'Grillattua vuohenlihaa · riisiä · salaattia',
    subtitle_so: 'Hilib ari duban · bariis · salad',
    description_en: 'Tender grilled goat, aromatic rice.',
    description_fi: 'Mureaa grillattua vuohea, aromaattista riisiä.',
    description_so: 'Hilib ari duban, bariis udgoon.',
    long_description_en: 'Slow-grilled goat meat seasoned with cumin, turmeric and garlic, served over basmati rice with a fresh house salad and banana.',
    long_description_fi: 'Hitaasti grillattua vuohenlihaa maustettuna kuminalla, kurkumalla ja valkosipulilla, tarjoillaan basmatiriisin, tuoreen salaatin ja banaanin kera.',
    long_description_so: 'Hilib ari oo si tartiib ah loo dubay, kuna daray cumin, dhagax iyo toon, waxaa la socda bariis, salad iyo moos.',
    price: 14.50, category: 'food', image_url: '/images/hilib_ari.png', is_popular: 0, in_stock: 1,
    ingredients: JSON.stringify({ EN: ['Goat','Rice','Cumin','Turmeric','Salad'], FI: ['Vuohenliha','Riisi','Kumina','Kurkuma','Salaatti'], SO: ['Hilib ari','Bariis','Xawaash','Qurac','Salad'] }),
    allergens: JSON.stringify([
      { label: { EN: 'Cooked in shared kitchen', FI: 'Jaettu keittiö', SO: 'Jiko la wadaago' }, color: 'shared' },
    ]),
    meta: JSON.stringify({ halal: true, spice: { EN: 'Mild spice', FI: 'Mieto', SO: 'Aad u yar' }, serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' } }),
    sort_order: 1,
  },
  {
    id: 'cambuulo',
    name_en: 'Cambuulo', name_fi: 'Cambuulo (Pavut)', name_so: 'Cambuulo',
    subtitle_en: 'Adzuki beans · butter · sugar',
    subtitle_fi: 'Adzukipapuja · voita · sokeria',
    subtitle_so: 'Digir · subag · sonkor',
    description_en: 'Creamy beans, rich butter sauce.',
    description_fi: 'Kermainen papumuhennos, täyteläinen voikastike.',
    description_so: 'Digir jilicsan, suugo subag leh.',
    long_description_en: 'Traditional Somali adzuki beans slow-cooked until creamy, finished with melted butter and a touch of sugar. A comforting classic.',
    long_description_fi: 'Perinteiset somalialaiset adzukipavut hitaasti keitettynä kermaisiksi, viimeisteltynä sulatetulla voilla ja ripauksella sokeria.',
    long_description_so: 'Digir Soomaaliyeed oo la kariyay ilaa ay jilicsato, oo lagu daray subag dhalaalay iyo sonkor. Waa cunto macaan.',
    price: 8.00, category: 'food', image_url: '/images/cambuulo.png', is_popular: 0, in_stock: 1,
    ingredients: JSON.stringify({ EN: ['Adzuki beans','Butter','Sugar','Sesame oil'], FI: ['Adzukipavut','Voi','Sokeri','Seesamiöljy'], SO: ['Digirta','Subag','Sonkor','Saliid macsar'] }),
    allergens: JSON.stringify([
      { label: { EN: 'May contain dairy', FI: 'Saattaa sisältää maitoa', SO: 'Waxa laga yaabaa inuu leeyahay caano' }, color: 'dairy' },
    ]),
    meta: JSON.stringify({ halal: true, spice: { EN: 'No spice', FI: 'Ei mausteita', SO: "Basbaas la'aan" }, serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' } }),
    sort_order: 2,
  },
  {
    id: 'bur-saliid',
    name_en: 'Bur Saliid', name_fi: 'Bur Saliid (Öljyleipä)', name_so: 'Bur Saliid',
    subtitle_en: 'Somali flatbread · sesame · oil',
    subtitle_fi: 'Somalialainen litteä leipä · seesami · öljy',
    subtitle_so: 'Rooti Soomaaliyeed · macsar · saliid',
    description_en: 'Flaky flatbread brushed with sesame oil.',
    description_fi: 'Hillomaininen litteä leipä, sivelty seesamiöljyllä.',
    description_so: 'Rooti qallafsan oo saliid macsar lagu shuban.',
    long_description_en: 'Freshly baked Somali flatbread with layers of sesame oil and a golden, flaky crust — perfect as a side or on its own.',
    long_description_fi: 'Tuoreena paistettu somalialainen litteä leipä seesamiöljykerroksilla ja kultaisella rapealla kuorella — täydellinen lisuke tai sellaisenaan.',
    long_description_so: 'Rooti Soomaaliyeed oo cusub oo dhuumah iyo saliid macsar leh — waa ku habboon tahay dhinac ahaan ama afsanaane.',
    price: 3.00, category: 'pastry', image_url: '/images/bur_saliid.png', is_popular: 0, in_stock: 1,
    ingredients: JSON.stringify({ EN: ['Flour','Sesame oil','Salt','Water'], FI: ['Jauho','Seesamiöljy','Suola','Vesi'], SO: ['Buri','Saliid macsar','Cusbo','Biyo'] }),
    allergens: JSON.stringify([
      { label: { EN: 'Gluten (wheat)', FI: 'Gluteeni (vehnä)', SO: 'Gluten (qamadi)' }, color: 'wheat' },
    ]),
    meta: JSON.stringify({ halal: true, spice: { EN: 'No spice', FI: 'Ei mausteita', SO: "Basbaas la'aan" }, serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' } }),
    sort_order: 0,
  },
  {
    id: 'sambusa',
    name_en: 'Sambusa', name_fi: 'Sambusa', name_so: 'Sambuus',
    subtitle_en: 'Crisp pastry · spiced beef · 2 pcs',
    subtitle_fi: 'Rapea leivonnainen · mausteinen nauta · 2 kpl',
    subtitle_so: 'Sambuus qallafsan · hilib basbaas leh · 2 xabbo',
    description_en: 'Crisp pastry, spiced beef filling. 2 pcs.',
    description_fi: 'Rapea leivonnainen, mausteinen naudanlihatäyte. 2 kpl.',
    description_so: 'Sambuus qallafsan, hilib shiidan. 2 xabbo.',
    long_description_en: 'Hand-folded crispy pastry triangles stuffed with a fragrant mixture of spiced ground beef, onions and fresh herbs. Served golden and piping hot.',
    long_description_fi: 'Käsin taitellut rapeat kolmiot, täytteenä mausteista jauhelihaa, sipulia ja tuoreita yrttejä. Tarjoillaan kullanruskeina ja kuumina.',
    long_description_so: 'Sambuus saddex-geesood ah oo gacanta lagu sameeyay, dhexda laga buuxiyay hilib shiidan, basal iyo geedo yaryar. Waxaa la bixiyaa isagoo kulul.',
    price: 4.00, category: 'pastry', image_url: '/images/sambusa.png', is_popular: 1, in_stock: 1,
    ingredients: JSON.stringify({ EN: ['Beef','Onion','Flour','Xawaash'], FI: ['Naudanliha','Sipuli','Jauho','Xawaash'], SO: ['Hilib','Basal','Buri','Xawaash'] }),
    allergens: JSON.stringify([
      { label: { EN: 'Gluten (wheat)', FI: 'Gluteeni (vehnä)', SO: 'Gluten (qamadi)' }, color: 'wheat' },
    ]),
    meta: JSON.stringify({ halal: true, spice: { EN: 'Medium spice', FI: 'Keskivahva', SO: 'Dhexdhexaad' }, serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' } }),
    sort_order: 1,
  },
  {
    id: 'malawah',
    name_en: 'Malawah', name_fi: 'Malawah', name_so: 'Malaawah',
    subtitle_en: 'Somali pancake · honey · cardamom',
    subtitle_fi: 'Somalialainen pannukakku · hunaja · kardemumma',
    subtitle_so: 'Malawah Soomaaliyeed · malab · hayl',
    description_en: 'Thin, sweet Somali crepe with honey.',
    description_fi: 'Ohut, makea somalialainen ohukkaat hunajalla.',
    description_so: 'Malaawah khafiif ah oo macaan, malab leh.',
    long_description_en: 'A thin, lacy Somali pancake made from fermented dough, served warm with honey, cardamom butter or sugar — a beloved breakfast and dessert.',
    long_description_fi: 'Ohut somalialainen ohukkaat happamasta taikinasta, tarjoillaan lämpimänä hunajan, kardemumma-voin tai sokerin kera — suosittu aamiainen ja jälkiruoka.',
    long_description_so: 'Malaawah khafiif ah oo Soomaaliyeed, waxaa laga sameeyaa oo lagu siiyo malab, subag hayl iyo sonkor — waa cunto aad loogu jecel yahay.',
    price: 5.00, category: 'desserts', image_url: '/images/malawah.png', is_popular: 0, in_stock: 1,
    ingredients: JSON.stringify({ EN: ['Flour','Egg','Milk','Honey','Cardamom'], FI: ['Jauho','Muna','Maito','Hunaja','Kardemumma'], SO: ['Buri','Ukun','Caano','Malab','Hayl'] }),
    allergens: JSON.stringify([
      { label: { EN: 'Gluten (wheat)', FI: 'Gluteeni (vehnä)', SO: 'Gluten (qamadi)' }, color: 'wheat' },
      { label: { EN: 'May contain dairy', FI: 'Saattaa sisältää maitoa', SO: 'Waxa laga yaabaa inuu leeyahay caano' }, color: 'dairy' },
    ]),
    meta: JSON.stringify({ halal: true, spice: { EN: 'No spice', FI: 'Ei mausteita', SO: "Basbaas la'aan" }, serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' } }),
    sort_order: 0,
  },
  {
    id: 'shaah-cadays',
    name_en: 'Shaah Cadays', name_fi: 'Shaah Cadays (Maitotee)', name_so: 'Shaah Cadays',
    subtitle_en: 'Somali spiced tea · cardamom · milk',
    subtitle_fi: 'Somalialainen maustetee · kardemumma · maito',
    subtitle_so: 'Shaah Soomaaliyeed · hayl · caano',
    description_en: 'Spiced Somali milk tea with cardamom.',
    description_fi: 'Mausteinen somalialainen maitotee kardemummalla.',
    description_so: 'Shaah caano leh iyo hayl.',
    long_description_en: 'Rich black tea simmered with whole cardamom, cinnamon and cloves, finished with steamed milk and sugar. The soul of Somali hospitality.',
    long_description_fi: 'Täyteläinen musta tee, haudutettu kardemummalla, kanelilla ja neilikalla. Viimeistelty höyrytetyllä maidolla ja sokerilla.',
    long_description_so: 'Shaah madow oo lagu kariyay hayl, qorfe iyo dhegayare, laguna daray caano iyo sonkor. Waa sooryada Soomaalida.',
    price: 3.50, category: 'warm-drinks', image_url: '/images/shaah.png', is_popular: 1, in_stock: 1,
    ingredients: JSON.stringify({ EN: ['Black tea','Cardamom','Cinnamon','Milk','Sugar'], FI: ['Musta tee','Kardemumma','Kaneli','Maito','Sokeri'], SO: ['Shaah madow','Hayl','Qorfe','Caano','Sonkor'] }),
    allergens: JSON.stringify([
      { label: { EN: 'May contain dairy', FI: 'Saattaa sisältää maitoa', SO: 'Caano' }, color: 'dairy' },
    ]),
    meta: JSON.stringify({ halal: true, spice: { EN: 'No spice', FI: 'Ei mausteita', SO: "Basbaas la'aan" }, serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' } }),
    sort_order: 0,
  },
]

// ── Run seed if tables are empty ─────────────────────────────────────────────
const catCount = db.prepare('SELECT COUNT(*) as n FROM categories').get()
if (catCount.n === 0) {
  const insertCat = db.prepare(
    'INSERT OR IGNORE INTO categories (id,label_en,label_fi,label_so,sort_order) VALUES (?,?,?,?,?)'
  )
  for (const c of seedCategories) {
    insertCat.run(c.id, c.label_en, c.label_fi, c.label_so, c.sort_order)
  }
}

const dishCount = db.prepare('SELECT COUNT(*) as n FROM dishes').get()
if (dishCount.n === 0) {
  const insertDish = db.prepare(`
    INSERT OR IGNORE INTO dishes
      (id,name_en,name_fi,name_so,subtitle_en,subtitle_fi,subtitle_so,
       description_en,description_fi,description_so,
       long_description_en,long_description_fi,long_description_so,
       price,category,image_url,is_popular,in_stock,ingredients,allergens,meta,sort_order)
    VALUES
      (@id,@name_en,@name_fi,@name_so,@subtitle_en,@subtitle_fi,@subtitle_so,
       @description_en,@description_fi,@description_so,
       @long_description_en,@long_description_fi,@long_description_so,
       @price,@category,@image_url,@is_popular,@in_stock,@ingredients,@allergens,@meta,@sort_order)
  `)
  for (const d of seedDishes) insertDish.run(d)
}

// ── Exported queries ─────────────────────────────────────────────────────────
export const queries = {
  getAllCategories: () =>
    db.prepare('SELECT * FROM categories ORDER BY sort_order').all(),

  getPublicDishes: () =>
    db.prepare('SELECT * FROM dishes WHERE in_stock=1 ORDER BY category, sort_order').all().map(rowToDish),

  getAllDishes: () =>
    db.prepare('SELECT * FROM dishes ORDER BY category, sort_order').all().map(rowToDish),

  getDishById: (id) => {
    const row = db.prepare('SELECT * FROM dishes WHERE id=?').get(id)
    return row ? rowToDish(row) : null
  },

  createDish: (data) => {
    const id = data.id || data.name.EN.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    db.prepare(`
      INSERT INTO dishes
        (id,name_en,name_fi,name_so,subtitle_en,subtitle_fi,subtitle_so,
         description_en,description_fi,description_so,
         long_description_en,long_description_fi,long_description_so,
         price,category,image_url,is_popular,in_stock,ingredients,allergens,meta)
      VALUES
        (@id,@name_en,@name_fi,@name_so,@subtitle_en,@subtitle_fi,@subtitle_so,
         @description_en,@description_fi,@description_so,
         @long_description_en,@long_description_fi,@long_description_so,
         @price,@category,@image_url,@is_popular,@in_stock,@ingredients,@allergens,@meta)
    `).run({
      id,
      name_en: data.name.EN, name_fi: data.name.FI, name_so: data.name.SO,
      subtitle_en: data.subtitle.EN, subtitle_fi: data.subtitle.FI, subtitle_so: data.subtitle.SO,
      description_en: data.description.EN, description_fi: data.description.FI, description_so: data.description.SO,
      long_description_en: data.longDescription.EN, long_description_fi: data.longDescription.FI, long_description_so: data.longDescription.SO,
      price: data.price,
      category: data.category,
      image_url: data.image || '',
      is_popular: data.isPopular ? 1 : 0,
      in_stock:   data.inStock  !== false ? 1 : 0,
      ingredients: JSON.stringify(data.ingredients || { EN: [], FI: [], SO: [] }),
      allergens:   JSON.stringify(data.allergens   || []),
      meta:        JSON.stringify(data.meta        || {}),
    })
    return queries.getDishById(id)
  },

  updateDish: (id, data) => {
    const fields = []
    const params = {}
    const map = {
      'name.EN': 'name_en', 'name.FI': 'name_fi', 'name.SO': 'name_so',
      'subtitle.EN': 'subtitle_en', 'subtitle.FI': 'subtitle_fi', 'subtitle.SO': 'subtitle_so',
      'description.EN': 'description_en', 'description.FI': 'description_fi', 'description.SO': 'description_so',
      'longDescription.EN': 'long_description_en', 'longDescription.FI': 'long_description_fi', 'longDescription.SO': 'long_description_so',
    }

    // Handle nested multilingual fields
    for (const [dotKey, col] of Object.entries(map)) {
      const [parent, lang] = dotKey.split('.')
      if (data[parent]?.[lang] !== undefined) {
        fields.push(`${col} = @${col}`)
        params[col] = data[parent][lang]
      }
    }

    // Handle flat fields
    const flat = { price: 'price', category: 'category', image: 'image_url' }
    for (const [key, col] of Object.entries(flat)) {
      if (data[key] !== undefined) { fields.push(`${col} = @${col}`); params[col] = data[key] }
    }
    if (data.isPopular !== undefined) { fields.push('is_popular = @is_popular'); params.is_popular = data.isPopular ? 1 : 0 }
    if (data.inStock   !== undefined) { fields.push('in_stock = @in_stock');   params.in_stock   = data.inStock   ? 1 : 0 }
    if (data.ingredients !== undefined) { fields.push('ingredients = @ingredients'); params.ingredients = JSON.stringify(data.ingredients) }
    if (data.allergens   !== undefined) { fields.push('allergens = @allergens');   params.allergens   = JSON.stringify(data.allergens) }
    if (data.meta        !== undefined) { fields.push('meta = @meta');             params.meta        = JSON.stringify(data.meta) }

    if (fields.length === 0) return queries.getDishById(id)
    params.id = id
    db.prepare(`UPDATE dishes SET ${fields.join(', ')} WHERE id = @id`).run(params)
    return queries.getDishById(id)
  },

  deleteDish: (id) => {
    db.prepare('DELETE FROM dishes WHERE id = ?').run(id)
  },
}

export default db
