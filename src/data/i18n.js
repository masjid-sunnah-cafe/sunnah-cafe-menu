// Static UI strings and categories — these don't change often enough to need DB storage

export const LANGS = ['EN', 'FI', 'SO']

export const categories = [
  { id: 'food',        label: { EN: 'Food',        FI: 'Ruoka',         SO: 'Cunto' } },
  { id: 'pastry',      label: { EN: 'Pastry',      FI: 'Leivonnaiset',  SO: 'Rooti' } },
  { id: 'desserts',    label: { EN: 'Desserts',    FI: 'Jälkiruoat',    SO: 'Macmacaan' } },
  { id: 'warm-drinks', label: { EN: 'Warm Drinks', FI: 'Kuumat juomat', SO: 'Cabitaan kulul' } },
  { id: 'cold-drinks', label: { EN: 'Cold Drinks', FI: 'Kylmät juomat', SO: 'Cabitaano qabow' } },
]

export const UI = {
  subtitle:         { EN: 'Somali Kitchen · Helsinki', FI: 'Somalialainen keittiö · Helsinki', SO: 'Jikada Soomaaliyeed · Helsinki' },
  popular:          { EN: 'Popular', FI: 'Suosittu', SO: 'Caansan' },
  noDishes:         { EN: 'No dishes in this category', FI: 'Ei ruokia tässä kategoriassa', SO: 'Cunto kuma jirto qaybtan' },
  ingredientsLabel: { EN: 'Ingredients', FI: 'Ainesosat', SO: 'Shaxda' },
  allergensLabel:   { EN: 'Allergens', FI: 'Allergeenit', SO: 'Waxyaabaha khatarta ah' },
  goodToKnowLabel:  { EN: 'Good to know', FI: 'Hyvä tietää', SO: 'Wax muhiim ah' },
  backToMenu:       { EN: '← Back to menu', FI: '← Takaisin menuun', SO: '← Ku noqo liiska' },
  loading:          { EN: 'Loading menu…', FI: 'Ladataan menua…', SO: 'La rarayo liiska…' },
  error:            { EN: 'Could not load menu', FI: 'Menua ei voitu ladata', SO: 'Liiska lama soo qaadi karin' },
  searchPlaceholder: { EN: 'Search the menu…', FI: 'Hae ruokalistalta…', SO: 'Ka raadi menu-ga…' },
  noResults:         { EN: 'Nothing found — try another word.', FI: 'Ei tuloksia — kokeile toista hakusanaa.', SO: 'Waxba lama helin — isku day eray kale.' },
  searchResults:     { EN: 'Search results', FI: 'Hakutulokset', SO: 'Natiijada raadinta' },
  categoriesLabel:   { EN: 'Categories', FI: 'Kategoriat', SO: 'Qaybaha' },
  close:             { EN: 'Close', FI: 'Sulje', SO: 'Xir' },
}

export function getDishesText(lang, count) {
  if (lang === 'FI') return `${count} annosta`
  if (lang === 'SO') return `${count} cunto`
  return `${count} dish${count !== 1 ? 'es' : ''}`
}

export function getL10n(field, lang) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang] || field['EN'] || Object.values(field)[0] || ''
}

export function getL10nArray(field, lang) {
  if (!field) return []
  if (Array.isArray(field)) return field
  if (field[lang] && Array.isArray(field[lang])) return field[lang]
  if (field['EN'] && Array.isArray(field['EN'])) return field['EN']
  const first = Object.values(field)[0]
  if (Array.isArray(first)) return first
  return []
}
