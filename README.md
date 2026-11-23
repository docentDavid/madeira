# Madeira reisgids

Toegankelijke, mobielvriendelijke en offline bruikbare wandelreisgids voor Madeira, 17–23 december 2026.

Statische site (HTML/CSS/JS) met een service worker voor offline gebruik, gehost via GitHub Pages.

## Testen

- Toegankelijkheid (pa11y is globaal geïnstalleerd, er zijn geen lokale packages nodig):
  `pa11y https://docentdavid.github.io/madeira/` en `pa11y --runner axe https://docentdavid.github.io/madeira/`
- Datum simuleren (banner "Vandaag", tab Dagen): voeg `?datum=2026-12-23` toe aan de URL.
