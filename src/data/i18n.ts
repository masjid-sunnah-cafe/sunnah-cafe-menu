// Static UI strings and categories — these don't change often enough to need DB storage

export const LANGS = ['FI', 'EN']

export const categories = [
  { id: 'food',        label: { EN: 'Food',        FI: 'Ruoka' } },
  { id: 'pastry',      label: { EN: 'Pastry',      FI: 'Leivonnaiset' } },
  { id: 'desserts',    label: { EN: 'Desserts',    FI: 'Jälkiruoat' } },
  { id: 'warm-drinks', label: { EN: 'Warm Drinks', FI: 'Kuumat juomat' } },
  { id: 'cold-drinks', label: { EN: 'Cold Drinks', FI: 'Kylmät juomat' } },
]

export const UI = {
  subtitle:         { EN: 'Cafe and kitchen · Helsinki', FI: 'Kahvila ja keittiö · Helsinki' },
  popular:          { EN: 'Popular', FI: 'Suosittu' },
  noDishes:         { EN: 'No dishes in this category', FI: 'Ei ruokia tässä kategoriassa' },
  ingredientsLabel: { EN: 'Ingredients', FI: 'Ainesosat' },
  allergensLabel:   { EN: 'Allergens', FI: 'Allergeenit' },
  goodToKnowLabel:  { EN: 'Good to know', FI: 'Hyvä tietää' },
  backToMenu:       { EN: '← Back to menu', FI: '← Takaisin menuun' },
  loading:          { EN: 'Loading menu…', FI: 'Ladataan menua…' },
  error:            { EN: 'Could not load menu', FI: 'Menua ei voitu ladata' },
  searchPlaceholder: { EN: 'Search the menu…', FI: 'Hae ruokalistalta…' },
  noResults:         { EN: 'Nothing found — try another word.', FI: 'Ei tuloksia — kokeile toista hakusanaa.' },
  searchResults:     { EN: 'Search results', FI: 'Hakutulokset' },
  categoriesLabel:   { EN: 'Categories', FI: 'Kategoriat' },
  close:             { EN: 'Close', FI: 'Sulje' },
  addToCart:         { EN: 'Add to cart', FI: 'Lisää koriin' },
  cart:              { EN: 'Cart', FI: 'Ostoskori' },
  cartTitle:         { EN: 'Your order', FI: 'Tilauksesi' },
  emptyCart:         { EN: 'Your cart is empty', FI: 'Ostoskorisi on tyhjä' },
  browseMenu:        { EN: 'Browse the menu', FI: 'Selaa menua' },
  increaseQuantity:  { EN: 'Increase quantity', FI: 'Lisää määrää' },
  decreaseQuantity:  { EN: 'Decrease quantity', FI: 'Vähennä määrää' },
  removeItem:        { EN: 'Remove item', FI: 'Poista tuote' },
  total:             { EN: 'Total', FI: 'Yhteensä' },
  continueToCheckout: { EN: 'Continue to checkout', FI: 'Jatka tilaamaan' },
  backToCart:         { EN: 'Back to cart', FI: 'Takaisin ostoskoriin' },
  checkoutTitle:      { EN: 'Checkout', FI: 'Viimeistele tilaus' },
  customerDetails:    { EN: 'Your details', FI: 'Tietosi' },
  firstName:          { EN: 'First name', FI: 'Etunimi' },
  fulfillmentLocation: { EN: 'Where should we bring the order?', FI: 'Minne tilaus tuodaan?' },
  paymentMethod:      { EN: 'Payment method', FI: 'Maksutapa' },
  orderNote:          { EN: 'Order note (optional)', FI: 'Tilausohje (vapaaehtoinen)' },
  orderSummary:       { EN: 'Order summary', FI: 'Tilauksen yhteenveto' },
  placeOrder:         { EN: 'Place order', FI: 'Tee tilaus' },
  submittingOrder:    { EN: 'Placing order…', FI: 'Tilausta lähetetään…' },
  orderFailed:        { EN: 'Could not place the order.', FI: 'Tilausta ei voitu tehdä.' },
  locations: {
    counter_pickup:          { EN: 'Pick up at the counter', FI: 'Nouto kassalta' },
    womens_prayer_hall_door: { EN: "Women’s prayer hall door", FI: 'Naisten rukoussalin ovelle' },
    womens_cafe_hall:        { EN: "Women’s café hall", FI: 'Kahvion naisten saliin' },
    mens_cafe_hall:          { EN: "Men’s café hall", FI: 'Kahvion miesten saliin' },
  },
  paymentOptions: {
    sumup_online:       { EN: 'Pay online', FI: 'Maksa verkossa' },
    card_on_fulfillment: { EN: 'Pay at the counter', FI: 'Maksa tiskillä' },
    cash_on_fulfillment: { EN: 'Pay with cash', FI: 'Maksa käteisellä' },
  },
  paymentHelp: {
    sumup_online:       { EN: 'Pay through the SumUp payment link after staff confirm your order.', FI: 'Maksa SumUp-maksulinkillä, kun henkilökunta on vahvistanut tilauksesi.' },
    card_on_fulfillment: { EN: 'Pay at the counter before collecting your order.', FI: 'Maksa tiskillä ennen tilauksen noutamista.' },
    cash_on_fulfillment: { EN: 'Staff must approve the order within 10 minutes.', FI: 'Henkilökunnan pitää hyväksyä tilaus 10 minuutissa.' },
  },
  orderStatusTitle: { EN: 'Order status', FI: 'Tilauksen tila' },
  orderNumber: { EN: 'Order number', FI: 'Tilausnumero' },
  orderStatusMissing: { EN: 'This order cannot be opened on this device.', FI: 'Tätä tilausta ei voi avata tällä laitteella.' },
  orderStatusFailed: { EN: 'Could not update the order status.', FI: 'Tilauksen tilaa ei voitu päivittää.' },
  orderStatuses: {
    awaiting_payment: { EN: 'Waiting for online payment', FI: 'Odotetaan verkkomaksua' },
    awaiting_staff_approval: { EN: 'Waiting for staff approval', FI: 'Odotetaan henkilökunnan hyväksyntää' },
    accepted: { EN: 'Order accepted', FI: 'Tilaus hyväksytty' },
    preparing: { EN: 'Preparing your order', FI: 'Tilausta valmistellaan' },
    ready: { EN: 'Your order is ready', FI: 'Tilauksesi on valmis' },
    completed: { EN: 'Order handed over or delivered', FI: 'Tilaus luovutettu tai toimitettu' },
    cancelled: { EN: 'Order cancelled', FI: 'Tilaus peruttu' },
    expired: { EN: 'Approval time expired', FI: 'Hyväksymisaika päättyi' },
  },
  paymentStatuses: {
    unpaid: { EN: 'Pay on site', FI: 'Maksetaan paikan päällä' },
    pending: { EN: 'Payment pending', FI: 'Maksu odottaa' },
    paid: { EN: 'Paid', FI: 'Maksettu' },
    failed: { EN: 'Payment failed', FI: 'Maksu epäonnistui' },
    refunded: { EN: 'Refunded', FI: 'Hyvitetty' },
  },
  onlinePaymentStatuses: {
    unpaid: { EN: 'Online payment after approval', FI: 'Verkkomaksu hyväksynnän jälkeen' },
    pending: { EN: 'Payment pending', FI: 'Maksu odottaa' },
    paid: { EN: 'Paid online', FI: 'Maksettu verkossa' },
    failed: { EN: 'Online payment failed', FI: 'Verkkomaksu epäonnistui' },
    refunded: { EN: 'Refunded', FI: 'Hyvitetty' },
  },
  orderingClosed: { EN: 'The cafe is not accepting orders right now.', FI: 'Kahvila ei vastaanota tilauksia juuri nyt.' },
  approvalRequired: { EN: 'Staff will confirm availability before payment.', FI: 'Henkilökunta vahvistaa saatavuuden ennen maksua.' },
  payNow: { EN: 'Pay now', FI: 'Maksa nyt' },
  paymentAmount: { EN: 'Exact amount to pay', FI: 'Tarkka maksettava summa' },
  manualPaymentTitle: { EN: 'Before you pay', FI: 'Ennen kuin maksat' },
  manualPaymentIntro: {
    EN: 'The payment link opens in a new tab. Keep this page open and use the details below in SumUp.',
    FI: 'Maksulinkki avautuu uuteen välilehteen. Pidä tämä sivu avoinna ja käytä alla olevia tietoja SumUpissa.',
  },
  manualPaymentNameInstruction: {
    EN: 'Enter your order number {number} in the “Full name” field.',
    FI: 'Kirjoita “Koko nimi” -kenttään tilausnumerosi {number}.',
  },
  manualPaymentAmountInstruction: {
    EN: 'Enter exactly {amount} as the payment amount.',
    FI: 'Syötä maksun summaksi täsmälleen {amount}.',
  },
  manualPaymentVerification: {
    EN: 'Staff will compare the order number and amount before handing over the order. The order cannot be handed over if they do not match.',
    FI: 'Henkilökunta vertaa tilausnumeroa ja summaa ennen tilauksen luovutusta. Tilausta ei voida luovuttaa, jos tiedot eivät täsmää.',
  },
  startingPayment: { EN: 'Opening payment…', FI: 'Avataan maksua…' },
  paymentStartFailed: { EN: 'Could not start payment.', FI: 'Maksua ei voitu aloittaa.' },
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
