import sambusaImg from '../assets/images/sambusa.png'
import malawahImg from '../assets/images/malawah.png'
import suqaarImg from '../assets/images/suqaar.png'
import burSaliidImg from '../assets/images/bur_saliid.png'
import hilibAriImg from '../assets/images/hilib_ari.png'
import cambuuloImg from '../assets/images/cambuulo.png'
import shaahImg from '../assets/images/shaah.png'

export const LANGS = ['EN', 'FI', 'SO']

export const UI = {
  subtitle: {
    EN: 'Traditional Somali Kitchen · Digital Menu',
    FI: 'Perinteinen Somalialainen Keittiö · Digitaalinen Menu',
    SO: 'Cuntooyinka Dhaqanka Soomaalida · Menu Dijitaal ah',
  },
  ingredientsLabel: {
    EN: 'Ingredients',
    FI: 'Ainesosat',
    SO: 'Waxyaabaha',
  },
  allergensLabel: {
    EN: 'Allergens',
    FI: 'Allergeenit',
    SO: 'Xasaasiyad',
  },
  goodToKnowLabel: {
    EN: 'Good to Know',
    FI: 'Hyvä tietää',
    SO: 'Wanaagsan in la ogaado',
  },
  backToMenu: {
    EN: 'Back to menu',
    FI: 'Takaisin valikkoon',
    SO: 'Ku noqo menu-ga',
  },
  noDishes: {
    EN: 'No dishes in this category.',
    FI: 'Ei annoksia tässä kategoriassa.',
    SO: 'Cuntooyin lagama helin qaybtan.',
  },
  popular: {
    EN: 'Popular',
    FI: 'Suosittu',
    SO: 'Caadi ah',
  }
}

export const getDishesText = (lang, count) => {
  if (lang === 'FI') return `${count} ${count === 1 ? 'annos' : 'annosta'}`
  if (lang === 'SO') return `${count} cunto`
  return `${count} ${count === 1 ? 'dish' : 'dishes'}`
}

export const categories = [
  { id: 'food', label: { EN: 'Food', FI: 'Ruoka', SO: 'Cunto' } },
  { id: 'pastry', label: { EN: 'Pastry', FI: 'Leivonnaiset', SO: 'Macmacaan' } },
  { id: 'desserts', label: { EN: 'Desserts', FI: 'Jälkiruoat', SO: 'Macaan' } },
  { id: 'warm-drinks', label: { EN: 'Warm Drinks', FI: 'Kuumat juomat', SO: 'Cabitaano kulul' } },
  { id: 'cold-drinks', label: { EN: 'Cold Drinks', FI: 'Kylmät juomat', SO: 'Cabitaano qabow' } },
]

export const dishes = [
  // ─── Food ───
  {
    id: 'suqaar-sabaayad',
    name: { EN: 'Suqaar iyo Sabaayad', FI: 'Suqaar ja Sabaayad', SO: 'Suqaar iyo Sabaayad' },
    subtitle: {
      EN: 'Sautéed beef · peppers · Somali flatbread',
      FI: 'Paistettua naudanlihaa · paprikaa · somalialaista leipää',
      SO: 'Hilib suqaar · basbaas · sabaayad Soomaaliyeed'
    },
    description: {
      EN: 'Crisp pastry, spiced beef filling. 2 pcs.',
      FI: 'Rapea leivonnainen, mausteinen naudanlihatäyte. 2 kpl.',
      SO: 'Sabaayad qallafsan, hilib shiidan oo basbaas leh. 2 xabbo.'
    },
    longDescription: {
      EN: 'Tender strips of beef suqaar wok-tossed with onion, capsicum and xawaash spice, folded into warm hand-rolled sabaayad — a Zahiiba house favourite.',
      FI: 'Mureita naudanlihasuikaleita paistettuna sipulin, paprikan ja xawaash-mausteen kera, käärittynä lämpimään käsintehtyyn sabaayadiin — Zahiiban suosikki.',
      SO: 'Hilib suqaar oo khafiif ah oo lagu shiilay basaal, basal iyo xawaash, oo lagu duudduubay sabaayad gacanta lagu sameeyay — kan ugu caansan Zahiiba.'
    },
    price: 11.00,
    category: 'food',
    image: suqaarImg,
    isPopular: true,
    ingredients: {
      EN: ['Beef', 'Xawaash', 'Capsicum', 'Onion', 'Sabaayad'],
      FI: ['Naudanliha', 'Xawaash', 'Paprika', 'Sipuli', 'Sabaayad'],
      SO: ['Hilibka', 'Xawaash', 'Basbaas', 'Basal', 'Sabaayad']
    },
    allergens: [
      { label: { EN: 'Gluten (wheat)', FI: 'Gluteeni (vehnä)', SO: 'Gluten (qamadi)' }, color: 'wheat' },
      { label: { EN: 'Cooked in shared kitchen', FI: 'Jaettu keittiö', SO: 'Jiko la wadaago' }, color: 'shared' },
    ],
    meta: {
      halal: true,
      spice: { EN: 'Medium spice', FI: 'Keskivahva', SO: 'Dhexdhexaad' },
      serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' }
    },
  },
  {
    id: 'hilib-ari',
    name: { EN: 'Hilib Ari', FI: 'Hilib Ari (Vuohenlihaa)', SO: 'Hilib Ari' },
    subtitle: {
      EN: 'Grilled goat · rice · salad',
      FI: 'Grillattua vuohenlihaa · riisiä · salaattia',
      SO: 'Hilib ari duban · bariis · salad'
    },
    description: {
      EN: 'Tender grilled goat, aromatic rice.',
      FI: 'Mureaa grillattua vuohea, aromaattista riisiä.',
      SO: 'Hilib ari duban, bariis udgoon.'
    },
    longDescription: {
      EN: 'Slow-grilled goat meat seasoned with cumin, turmeric and garlic, served over basmati rice with a fresh house salad and banana.',
      FI: 'Hitaasti grillattua vuohenlihaa maustettuna kuminalla, kurkumalla ja valkosipulilla, tarjoillaan basmatiriisin, tuoreen salaatin ja banaanin kera.',
      SO: 'Hilib ari oo si tartiib ah loo dubay, kuna daray cumin, dhagax iyo toon, waxaa la socda bariis, salad iyo moos.'
    },
    price: 14.50,
    category: 'food',
    image: hilibAriImg,
    isPopular: false,
    ingredients: {
      EN: ['Goat', 'Rice', 'Cumin', 'Turmeric', 'Salad'],
      FI: ['Vuohenliha', 'Riisi', 'Kumina', 'Kurkuma', 'Salaatti'],
      SO: ['Hilib ari', 'Bariis', 'Xawaash', 'Qurac', 'Salad']
    },
    allergens: [
      { label: { EN: 'Cooked in shared kitchen', FI: 'Jaettu keittiö', SO: 'Jiko la wadaago' }, color: 'shared' },
    ],
    meta: {
      halal: true,
      spice: { EN: 'Mild spice', FI: 'Mieto', SO: 'Aad u yar' },
      serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' }
    },
  },
  {
    id: 'cambuulo',
    name: { EN: 'Cambuulo', FI: 'Cambuulo (Pavut)', SO: 'Cambuulo' },
    subtitle: {
      EN: 'Adzuki beans · butter · sugar',
      FI: 'Adzukipapuja · voita · sokeria',
      SO: 'Digir · subag · sonkor'
    },
    description: {
      EN: 'Creamy beans, rich butter sauce.',
      FI: 'Kermainen papumuhennos, täyteläinen voikastike.',
      SO: 'Digir jilicsan, suugo subag leh.'
    },
    longDescription: {
      EN: 'Traditional Somali adzuki beans slow-cooked until creamy, finished with melted butter and a touch of sugar. A comforting classic.',
      FI: 'Perinteiset somalialaiset adzukipavut hitaasti keitettynä kermaisiksi, viimeisteltynä sulatetulla voilla ja ripauksella sokeria.',
      SO: 'Digir Soomaaliyeed oo la kariyay ilaa ay jilicsato, oo lagu daray subag dhalaalay iyo sonkor. Waa cunto macaan.'
    },
    price: 8.00,
    category: 'food',
    image: cambuuloImg,
    isPopular: false,
    ingredients: {
      EN: ['Adzuki beans', 'Butter', 'Sugar', 'Sesame oil'],
      FI: ['Adzukipavut', 'Voi', 'Sokeri', 'Seesamiöljy'],
      SO: ['Digirta', 'Subag', 'Sonkor', 'Saliid macsar']
    },
    allergens: [
      { label: { EN: 'May contain dairy', FI: 'Saattaa sisältää maitoa', SO: 'Waxa laga yaabaa inuu leeyahay caano' }, color: 'dairy' },
    ],
    meta: {
      halal: true,
      spice: { EN: 'No spice', FI: 'Ei mausteita', SO: 'Basbaas la\'aan' },
      serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' }
    },
  },

  // ─── Pastry ───
  {
    id: 'sambusa',
    name: { EN: 'Sambusa', FI: 'Sambusa', SO: 'Sambuus' },
    subtitle: {
      EN: 'Crisp pastry · spiced beef · 2 pcs',
      FI: 'Rapea leivonnainen · mausteinen nauta · 2 kpl',
      SO: 'Sambuus qallafsan · hilib basbaas leh · 2 xabbo'
    },
    description: {
      EN: 'Crisp pastry, spiced beef filling. 2 pcs.',
      FI: 'Rapea leivonnainen, mausteinen naudanlihatäyte. 2 kpl.',
      SO: 'Sambuus qallafsan, hilib shiidan. 2 xabbo.'
    },
    longDescription: {
      EN: 'Hand-folded crispy pastry triangles stuffed with a fragrant mixture of spiced ground beef, onions and fresh herbs. Served golden and piping hot.',
      FI: 'Käsin taitellut rapeat kolmiot, täytteenä mausteista jauhelihaa, sipulia ja tuoreita yrttejä. Tarjoillaan kullanruskeina ja kuumina.',
      SO: 'Sambuus saddex-geesood ah oo gacanta lagu sameeyay, dhexda laga buuxiyay hilib shiidan, basal iyo geedo yaryar. Waxaa la bixiyaa isagoo kulul.'
    },
    price: 4.00,
    category: 'pastry',
    image: sambusaImg,
    isPopular: true,
    ingredients: {
      EN: ['Beef', 'Onion', 'Flour', 'Xawaash'],
      FI: ['Naudanliha', 'Sipuli', 'Jauho', 'Xawaash'],
      SO: ['Hilib', 'Basal', 'Buri', 'Xawaash']
    },
    allergens: [
      { label: { EN: 'Gluten (wheat)', FI: 'Gluteeni (vehnä)', SO: 'Gluten (qamadi)' }, color: 'wheat' },
    ],
    meta: {
      halal: true,
      spice: { EN: 'Medium spice', FI: 'Keskivahva', SO: 'Dhexdhexaad' },
      serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' }
    },
  },

  // ─── Warm Drinks ───
  {
    id: 'shaah-cadays',
    name: { EN: 'Shaah Cadays', FI: 'Shaah Cadays (Maitotee)', SO: 'Shaah Cadays' },
    subtitle: {
      EN: 'Somali spiced tea · cardamom · milk',
      FI: 'Somalialainen maustetee · kardemumma · maito',
      SO: 'Shaah Soomaaliyeed · hayl · caano'
    },
    description: {
      EN: 'Spiced Somali milk tea with cardamom.',
      FI: 'Mausteinen somalialainen maitotee kardemummalla.',
      SO: 'Shaah caano leh iyo hayl.'
    },
    longDescription: {
      EN: 'Rich black tea simmered with whole cardamom, cinnamon and cloves, finished with steamed milk and sugar. The soul of Somali hospitality.',
      FI: 'Täyteläinen musta tee, haudutettu kardemummalla, kanelilla ja neilikalla. Viimeistelty höyrytetyllä maidolla ja sokerilla.',
      SO: 'Shaah madow oo lagu kariyay hayl, qorfe iyo dhegayare, laguna daray caano iyo sonkor. Waa sooryada Soomaalida.'
    },
    price: 3.50,
    category: 'warm-drinks',
    image: shaahImg,
    isPopular: true,
    ingredients: {
      EN: ['Black tea', 'Cardamom', 'Cinnamon', 'Milk', 'Sugar'],
      FI: ['Musta tee', 'Kardemumma', 'Kaneli', 'Maito', 'Sokeri'],
      SO: ['Shaah madow', 'Hayl', 'Qorfe', 'Caano', 'Sonkor']
    },
    allergens: [
      { label: { EN: 'May contain dairy', FI: 'Saattaa sisältää maitoa', SO: 'Caano' }, color: 'dairy' },
    ],
    meta: {
      halal: true,
      spice: { EN: 'No spice', FI: 'Ei mausteita', SO: 'Basbaas la\'aan' },
      serves: { EN: 'Serves 1', FI: '1 hengelle', SO: '1 qof' }
    },
  },
]
