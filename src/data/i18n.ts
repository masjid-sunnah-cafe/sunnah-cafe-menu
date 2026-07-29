// Static UI strings and categories — these don't change often enough to need DB storage

export const LANGS = ['FI', 'EN']

export const categories = [
  { id: 'food',        label: { EN: 'Food',        FI: 'Ruoka',         SO: 'Cunto' } },
  { id: 'pastry',      label: { EN: 'Pastry',      FI: 'Leivonnaiset',  SO: 'Rooti' } },
  { id: 'desserts',    label: { EN: 'Desserts',    FI: 'Jälkiruoat',    SO: 'Macmacaan' } },
  { id: 'warm-drinks', label: { EN: 'Warm Drinks', FI: 'Kuumat juomat', SO: 'Cabitaan kulul' } },
  { id: 'cold-drinks', label: { EN: 'Cold Drinks', FI: 'Kylmät juomat', SO: 'Cabitaano qabow' } },
]

export const UI = {
  subtitle:         { EN: 'Cafe and kitchen · Helsinki', FI: 'Kahvila ja keittiö · Helsinki', SO: 'Maqaaxi iyo jiko · Helsinki' },
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
  addToCart:         { EN: 'Add to cart', FI: 'Lisää koriin', SO: 'Ku dar dambiisha' },
  cart:              { EN: 'Cart', FI: 'Ostoskori', SO: 'Dambiisha' },
  cartTitle:         { EN: 'Your order', FI: 'Tilauksesi', SO: 'Dalabkaaga' },
  emptyCart:         { EN: 'Your cart is empty', FI: 'Ostoskorisi on tyhjä', SO: 'Dambiishaadu waa madhan tahay' },
  browseMenu:        { EN: 'Browse the menu', FI: 'Selaa menua', SO: 'Eeg menu-ga' },
  increaseQuantity:  { EN: 'Increase quantity', FI: 'Lisää määrää', SO: 'Kordhi tirada' },
  decreaseQuantity:  { EN: 'Decrease quantity', FI: 'Vähennä määrää', SO: 'Yaree tirada' },
  removeItem:        { EN: 'Remove item', FI: 'Poista tuote', SO: 'Ka saar sheyga' },
  total:             { EN: 'Total', FI: 'Yhteensä', SO: 'Wadarta' },
  continueToCheckout: { EN: 'Continue to checkout', FI: 'Jatka tilaamaan', SO: 'Sii wad dalabka' },
  backToCart:         { EN: 'Back to cart', FI: 'Takaisin ostoskoriin', SO: 'Ku noqo dambiisha' },
  checkoutTitle:      { EN: 'Checkout', FI: 'Viimeistele tilaus', SO: 'Dhammaystir dalabka' },
  customerDetails:    { EN: 'Your details', FI: 'Tietosi', SO: 'Macluumaadkaaga' },
  firstName:          { EN: 'First name', FI: 'Etunimi', SO: 'Magaca hore' },
  fulfillmentLocation: { EN: 'Where should we bring the order?', FI: 'Minne tilaus tuodaan?', SO: 'Halkee dalabka la keenayaa?' },
  paymentMethod:      { EN: 'Payment method', FI: 'Maksutapa', SO: 'Habka lacag-bixinta' },
  orderNote:          { EN: 'Order note (optional)', FI: 'Tilausohje (vapaaehtoinen)', SO: 'Faahfaahin dalab (ikhtiyaari)' },
  orderSummary:       { EN: 'Order summary', FI: 'Tilauksen yhteenveto', SO: 'Soo koobidda dalabka' },
  placeOrder:         { EN: 'Place order', FI: 'Tee tilaus', SO: 'Dalbo' },
  submittingOrder:    { EN: 'Placing order…', FI: 'Tilausta lähetetään…', SO: 'Dalabka waa la dirayaa…' },
  orderFailed:        { EN: 'Could not place the order.', FI: 'Tilausta ei voitu tehdä.', SO: 'Dalabka lama samayn karin.' },
  locations: {
    counter_pickup:          { EN: 'Pick up at the counter', FI: 'Nouto kassalta', SO: 'Ka qaado miiska lacagta' },
    womens_prayer_hall_door: { EN: "Women’s prayer hall door", FI: 'Naisten rukoussalin ovelle', SO: 'Albaabka qaybta salaadda haweenka' },
    womens_cafe_hall:        { EN: "Women’s café hall", FI: 'Kahvion naisten saliin', SO: 'Hoolka kafateeriyada haweenka' },
    mens_cafe_hall:          { EN: "Men’s café hall", FI: 'Kahvion miesten saliin', SO: 'Hoolka kafateeriyada ragga' },
  },
  paymentOptions: {
    sumup_online:       { EN: 'Pay online', FI: 'Maksa verkossa', SO: 'Ku bixi online' },
    card_on_fulfillment: { EN: 'Pay by card on site', FI: 'Maksa kortilla paikan päällä', SO: 'Kaarka kaga bixi goobta' },
    cash_on_fulfillment: { EN: 'Pay with cash', FI: 'Maksa käteisellä', SO: 'Ku bixi lacag caddaan ah' },
  },
  paymentHelp: {
    sumup_online:       { EN: 'Card, Apple Pay or Google Pay when available.', FI: 'Kortti, Apple Pay tai Google Pay saatavuuden mukaan.', SO: 'Kaar, Apple Pay ama Google Pay marka la heli karo.' },
    card_on_fulfillment: { EN: 'Pay at the counter when collecting your order.', FI: 'Maksa kortilla kassalla noudon yhteydessä.', SO: 'Kaarka kaga bixi miiska marka aad dalabka qaadanayso.' },
    cash_on_fulfillment: { EN: 'Staff must approve the order within 10 minutes.', FI: 'Henkilökunnan pitää hyväksyä tilaus 10 minuutissa.', SO: 'Shaqaaluhu waa inay 10 daqiiqo gudahood ansixiyaan.' },
  },
  cardDeliveredHelp: { EN: 'A staff member brings the SumUp card reader with your order.', FI: 'Työntekijä tuo SumUp-korttikoneen tilauksen mukana.', SO: 'Shaqaale ayaa qalabka kaarka SumUp la imanaya dalabka.' },
  orderStatusTitle: { EN: 'Order status', FI: 'Tilauksen tila', SO: 'Xaaladda dalabka' },
  orderNumber: { EN: 'Order number', FI: 'Tilausnumero', SO: 'Lambarka dalabka' },
  orderStatusMissing: { EN: 'This order cannot be opened on this device.', FI: 'Tätä tilausta ei voi avata tällä laitteella.', SO: 'Dalabkan lagama furi karo qalabkan.' },
  orderStatusFailed: { EN: 'Could not update the order status.', FI: 'Tilauksen tilaa ei voitu päivittää.', SO: 'Xaaladda dalabka lama cusboonaysiin karin.' },
  orderStatuses: {
    awaiting_payment: { EN: 'Waiting for online payment', FI: 'Odotetaan verkkomaksua', SO: 'Waxaa la sugayaa lacag-bixinta online-ka' },
    awaiting_staff_approval: { EN: 'Waiting for staff approval', FI: 'Odotetaan henkilökunnan hyväksyntää', SO: 'Waxaa la sugayaa ansixinta shaqaalaha' },
    accepted: { EN: 'Order accepted', FI: 'Tilaus hyväksytty', SO: 'Dalabka waa la aqbalay' },
    preparing: { EN: 'Preparing your order', FI: 'Tilausta valmistellaan', SO: 'Dalabka waa la diyaarinayaa' },
    ready: { EN: 'Your order is ready', FI: 'Tilauksesi on valmis', SO: 'Dalabkaagu waa diyaar' },
    completed: { EN: 'Order handed over or delivered', FI: 'Tilaus luovutettu tai toimitettu', SO: 'Dalabka waa la wareejiyay ama la geeyay' },
    cancelled: { EN: 'Order cancelled', FI: 'Tilaus peruttu', SO: 'Dalabka waa la joojiyay' },
    expired: { EN: 'Approval time expired', FI: 'Hyväksymisaika päättyi', SO: 'Waqtiga ansixinta wuu dhammaaday' },
  },
  paymentStatuses: {
    unpaid: { EN: 'Pay on site', FI: 'Maksetaan paikan päällä', SO: 'Goobta ku bixi' },
    pending: { EN: 'Payment pending', FI: 'Maksu odottaa', SO: 'Lacag-bixintu way sugaysaa' },
    paid: { EN: 'Paid', FI: 'Maksettu', SO: 'Waa la bixiyay' },
    failed: { EN: 'Payment failed', FI: 'Maksu epäonnistui', SO: 'Lacag-bixintu way fashilantay' },
    refunded: { EN: 'Refunded', FI: 'Hyvitetty', SO: 'Lacagta waa la celiyay' },
  },
  onlinePaymentStatuses: {
    unpaid: { EN: 'Online payment after approval', FI: 'Verkkomaksu hyväksynnän jälkeen', SO: 'Lacag-bixinta online-ka ansixinta kadib' },
    pending: { EN: 'Payment pending', FI: 'Maksu odottaa', SO: 'Lacag-bixintu way sugaysaa' },
    paid: { EN: 'Paid online', FI: 'Maksettu verkossa', SO: 'Online ayaa lagu bixiyay' },
    failed: { EN: 'Online payment failed', FI: 'Verkkomaksu epäonnistui', SO: 'Lacag-bixinta online-ka way fashilantay' },
    refunded: { EN: 'Refunded', FI: 'Hyvitetty', SO: 'Lacagta waa la celiyay' },
  },
  orderingClosed: { EN: 'The cafe is not accepting orders right now.', FI: 'Kahvila ei vastaanota tilauksia juuri nyt.', SO: 'Maqaaxidu hadda ma qaadanayso dalabyo.' },
  approvalRequired: { EN: 'Staff will confirm availability before payment.', FI: 'Henkilökunta vahvistaa saatavuuden ennen maksua.', SO: 'Shaqaaluhu waxay xaqiijinayaan helitaanka ka hor lacag-bixinta.' },
  payNow: { EN: 'Pay now', FI: 'Maksa nyt', SO: 'Bixi hadda' },
  startingPayment: { EN: 'Opening payment…', FI: 'Avataan maksua…', SO: 'Lacag-bixinta waa la furayaa…' },
  paymentStartFailed: { EN: 'Could not start payment.', FI: 'Maksua ei voitu aloittaa.', SO: 'Lacag-bixinta lama bilaabi karin.' },
}

export function getDishesText(lang, count) {
  if (lang === 'FI') return `${count} annosta`
  return `${count} dish${count !== 1 ? 'es' : ''}`
}

export function getL10n(field, lang) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang] || field['EN'] || Object.values(field)[0] || ''
}

export function getPaymentStatusLabel(paymentMethod, paymentStatus, lang) {
  const labels = paymentMethod === 'sumup_online' ? UI.onlinePaymentStatuses : UI.paymentStatuses
  return labels[paymentStatus]?.[lang] || labels[paymentStatus]?.EN || ''
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
