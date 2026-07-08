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
}

export function getDishesText(lang, count) {
  if (lang === 'FI') return `${count} annosta`
  if (lang === 'SO') return `${count} cunto`
  return `${count} dish${count !== 1 ? 'es' : ''}`
}
