begin;

with translations (id, name_en, subtitle_en, description_en, long_description_en) as (
  values
    ('e3f6c523-e255-4ffa-872a-b0516d0b43ab', 'Rubicon Mango', 'Mango-flavoured soft drink', 'Rubicon Mango soft drink', 'Rubicon Mango soft drink'),
    ('mangojuoma', 'Mango Drink', 'Mango-flavoured drink', 'Cold mango drink', 'Cold mango drink'),
    ('mango-crush', 'Mango Crush', 'Cold mango drink', 'Refreshing mango drink', 'Refreshing mango drink'),
    ('palestine-cola', 'Palestine Cola', 'Cold soft drink', 'Palestine Cola soft drink', 'Palestine Cola soft drink'),
    ('pieni-fanta-cola', 'Small Coca-Cola', 'Cold soft drink', 'Refreshing Coca-Cola', 'Coca-Cola soft drink'),
    ('red-bull', 'Red Bull', 'Cold energy drink', 'Red Bull energy drink', 'Red Bull energy drink'),
    ('rubicon', 'Rubicon Guava', 'Guava-flavoured soft drink', 'Rubicon Guava soft drink', 'Rubicon Guava soft drink'),
    ('shaani', 'Shaani', 'Cold soft drink', 'Shaani soft drink', 'Shaani soft drink'),
    ('special-sunnah', 'Special Sunnah', 'Sunnah Cafe special drink', 'Ask about today''s special', 'Ask about today''s special'),
    ('tiripi', 'Trippi', 'Cold juice drink', 'Juice drink', 'Ask staff about the available flavours'),
    ('vesi', 'Water', 'Chilled bottled water', 'Refreshing water', 'Refreshing water'),
    ('vimto-juoma', 'Vimto', 'Fruity soft drink', 'Vimto soft drink', 'Vimto soft drink'),
    ('xl-energiajuoma', 'XL Energy Drink', 'Cold energy drink', 'XL energy drink', 'XL energy drink'),
    ('ddeb9091-b60a-46e6-8a8f-faaaa084036e', 'Fruit Ice Pop', 'Fruit-flavoured ice pop', 'Fruit-flavoured ice pop', 'Fruit-flavoured ice pop'),
    ('mantelimaitelo', 'Almond Ice Cream', 'Almond-flavoured ice cream', 'Chilled almond ice cream', 'Chilled almond ice cream with a chocolate coating'),
    ('rulla-kebab', 'Kebab Wrap', 'Filled kebab wrap', 'Kebab wrap', 'Kebab wrap'),
    ('kebabrulla-ranskalaiset', 'Kebab Wrap + Fries', 'Kebab wrap and fries', 'Kebab wrap served with fries', 'Kebab wrap served with fries'),
    ('kebabrulla-ateria', 'Kebab Wrap Meal', 'Filling kebab wrap meal', 'Kebab wrap, Sunnah Cafe style', 'Kebab wrap, fries and a soft drink'),
    ('pelkka-ranskalaiset', 'French Fries', 'Crispy French fries', 'A portion of French fries', 'A portion of French fries'),
    ('kebab-salaatti', 'Kebab Salad', 'Kebab with fresh salad', 'A serving of kebab salad', 'A serving of kebab salad'),
    ('malawax', 'Malawax', 'Thin Somali pancake', 'Traditional malawax', 'Traditional malawax'),
    ('sambusa', 'Sambusa', 'Crispy filled Somali pastry', 'Warm sambusa', 'Warm sambusa'),
    ('baklava', 'Baklava', 'A tasty sweet treat', 'A sweet serving of baklava', 'A sweet serving of baklava'),
    ('purkka-xanjo', 'Chewing Gum', 'Chewing gum', 'Pack of chewing gum', 'Pack of chewing gum'),
    ('sipsi', 'Crisps', 'Crispy potato crisps', 'Small bag of crisps', 'Small bag of crisps'),
    ('tikkari', 'Lollipop', 'Sweet lollipop', 'Small lollipop', 'Small lollipop'),
    ('cappuccino', 'Cappuccino', 'Espresso with steamed milk', 'Classic cappuccino', 'Classic cappuccino'),
    ('tee-iso', 'Large Tea', 'Somali hot tea', 'A warm serving of tea', 'A warm serving of tea'),
    ('tee-pieni', 'Small Tea', 'Somali hot tea', 'A warm serving of tea', 'A warm serving of tea')
),
updated as (
  update public.dishes as dish
  set
    name = jsonb_set(
      jsonb_set(dish.name, '{FI}', to_jsonb(regexp_replace(dish.name ->> 'FI', '\.+$', '')), true),
      '{EN}', to_jsonb(translations.name_en), true
    ),
    subtitle = jsonb_set(
      jsonb_set(dish.subtitle, '{FI}', to_jsonb(regexp_replace(dish.subtitle ->> 'FI', '\.+$', '')), true),
      '{EN}', to_jsonb(translations.subtitle_en), true
    ),
    description = jsonb_set(
      jsonb_set(dish.description, '{FI}', to_jsonb(regexp_replace(dish.description ->> 'FI', '\.+$', '')), true),
      '{EN}', to_jsonb(translations.description_en), true
    ),
    long_description = jsonb_set(
      jsonb_set(dish.long_description, '{FI}', to_jsonb(regexp_replace(dish.long_description ->> 'FI', '\.+$', '')), true),
      '{EN}', to_jsonb(translations.long_description_en), true
    ),
    meta = dish.meta - 'serves'
  from translations
  where dish.id = translations.id
  returning dish.id
)
select count(*) as translated_products from updated;

commit;

select
  id,
  name ->> 'FI' as name_fi,
  name ->> 'EN' as name_en,
  subtitle ->> 'FI' as subtitle_fi,
  subtitle ->> 'EN' as subtitle_en,
  description ->> 'FI' as description_fi,
  description ->> 'EN' as description_en,
  long_description ->> 'FI' as long_description_fi,
  long_description ->> 'EN' as long_description_en,
  meta -> 'serves' as serves
from public.dishes
order by category, sort_order, id;