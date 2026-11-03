# SadRed PWA — MVP

Een Nederlandstalige Progressive Web App voor België. Gebruikers plaatsen spullen die opgehaald moeten worden en bepalen zelf welk bedrag ze aan de ophaler willen betalen.

## Wat zit erin?

- Registratie en inloggen via Supabase Auth (e-mail/wachtwoord)
- Publieke lijst met actieve advertenties, zoeken en categorieën
- Advertentie plaatsen met maximaal 5 foto's
- Foto-opslag via Supabase Storage
- Gesprekken per advertentie en realtime berichten
- Accountpagina en eenvoudige adminweergave
- PWA-manifest, service worker en mobielvriendelijke layout
- Row Level Security (RLS) voor database- en opslagtoegang

## Vereisten

- Node.js 20 of hoger
- Een Supabase-project
- Een hostingaccount voor statische websites (bijv. Vercel, Netlify of Cloudflare Pages)

## Lokaal starten

1. Installeer Node.js.
2. Pak het project uit en open een terminal in de projectmap.
3. Voer uit:

   ```bash
   npm install
   cp .env.example .env
   ```

4. Maak een Supabase-project aan via https://supabase.com.
5. Open in Supabase **Project Settings → API**. Kopieer Project URL en anon/public key naar `.env`:

   ```env
   VITE_SUPABASE_URL=https://jouw-project.supabase.co
   VITE_SUPABASE_ANON_KEY=jouw-anon-key
   ```

6. Open in Supabase **SQL Editor**, plak de volledige inhoud van `supabase/schema.sql` en voer uit.
7. Start:

   ```bash
   npm run dev
   ```

8. Open de lokale URL die Vite toont.

## Adminaccount instellen

1. Registreer je eigen account in SadRed.
2. Zoek je gebruikers-ID in Supabase → Authentication → Users.
3. Voer in SQL Editor uit:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = 'PLAK-HIER-JOUW-USER-UUID';
   ```

De adminfunctie is bewust niet publiek toegankelijk. Geef nooit je Supabase `service_role` key aan de browser of in `.env`.

## Online zetten

1. Push de projectmap naar een private of public GitHub repository.
2. Importeer de repository in Vercel/Netlify/Cloudflare Pages.
3. Stel dezelfde twee `VITE_SUPABASE_*` environment variables in bij de hostingprovider.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Voeg je live domein toe in Supabase → Authentication → URL Configuration (Site URL en Redirect URLs).

## Belangrijke aandachtspunten vóór publieke lancering

Dit is een werkende MVP-codebasis, maar nog geen volledig gecontroleerde commerciële productieomgeving. Regel vóór lancering:
- AVG/GDPR privacyverklaring, cookiebeleid waar nodig, gebruiksvoorwaarden en verwijder-/inzageproces.
- Moderatie, meldingen, blokkeren van gebruikers, anti-spam/rate limiting en e-mailverificatie.
- Server-side validatie en beveiligingsreview van RLS/storage policies.
- Regels voor afvaltransport, gemeentelijke afvalstromen, gevaarlijke materialen en eventuele vergunningen in België.
- Veilige betaalafhandeling indien je later betalingen/commissies in de app verwerkt. Deze MVP verwerkt geen betalingen.
- Back-ups, monitoring, foutmeldingen en toegankelijkheidstest.

## Bedrijfslogica

De ingevoerde `amount_eur` is het bedrag dat de plaatser aanbiedt te betalen aan de persoon die het voorwerp komt ophalen. Het is geen verkoopprijs van het voorwerp.
