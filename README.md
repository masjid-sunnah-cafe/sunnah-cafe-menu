# Sunnah Cafe

Responsive multilingual menu, ordering flow, and staff fulfillment queue for Sunnah Cafe. The customer app supports counter pickup and delivery to the mosque cafe and prayer-hall locations.

## Local development

```sh
npm install
npm run dev
```

The frontend reads these browser-safe variables from `.env`:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never put the Supabase service-role key or SumUp API key in a `VITE_` variable.

## Database

Run the SQL files in this order in the Supabase SQL editor:

1. `supabase/schema.sql`
2. `supabase/orders.sql`

The order migration creates the staff, order, immutable item snapshot, payment-attempt, and audit-event tables. It also enables RLS and adds the order table to Supabase Realtime.

To create a staff user, first invite or create the user in Supabase Auth, then insert their Auth user ID:

```sql
insert into public.staff_members (user_id, role, display_name)
values ('AUTH_USER_UUID', 'staff', 'Display name');
```

## Ordering functions

Set server-only function secrets:

```sh
supabase secrets set SUMUP_API_KEY=... SUMUP_MERCHANT_CODE=... PUBLIC_SITE_URL=https://example.com
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to deployed Supabase Edge Functions automatically. Deploy the functions with:

```sh
supabase functions deploy create-order
supabase functions deploy get-order-status
supabase functions deploy sumup-webhook --no-verify-jwt
```

Online prices are recalculated from the database. A SumUp redirect never marks an order paid: `sumup-webhook` retrieves the checkout from SumUp and atomically verifies the merchant, currency, amount, and status first.

Cash and card-on-fulfillment orders enter a 10-minute staff approval window. Physical SumUp reader payments are recorded manually by authenticated staff because SumUp POS Lite does not expose a public order-queue API.

## Validation

```sh
npm run typecheck
npm run build
```
