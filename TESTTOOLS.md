# Testtools voor websites en PWA's

Een overzicht van tools om een website of Progressive Web App (PWA) te controleren op toegankelijkheid, snelheid, kwaliteit en beveiliging. Per tool staat wat hij doet en wanneer je hem gebruikt.

Deze reisgids is getest met **pa11y**, **axe**, **WAVE** en **Lighthouse**. De tools hieronder vullen die aan.

> **Let op:** automatische tools vinden maar een deel van de toegankelijkheidsproblemen (ongeveer 30–40%). Handmatig testen met toetsenbord en screenreader blijft nodig.

## Inhoud

1. [Al gebruikt in dit project](#1-al-gebruikt-in-dit-project)
2. [Toegankelijkheid](#2-toegankelijkheid)
3. [Prestaties en PWA](#3-prestaties-en-pwa)
4. [Code, HTML en beveiliging](#4-code-html-en-beveiliging)
5. [Automatisch testen in de browser](#5-automatisch-testen-in-de-browser)
6. [Specifiek voor React en Next.js](#6-specifiek-voor-react-en-nextjs)
7. [Alles automatisch bij elke push](#7-alles-automatisch-bij-elke-push)
8. [Welke tool wanneer?](#8-welke-tool-wanneer)

---

## 1. Al gebruikt in dit project

| Tool | Waarvoor | Hoe |
|---|---|---|
| [pa11y](https://pa11y.org/) | Toegankelijkheid testen vanaf de terminal, standaard met de regels van HTML_CodeSniffer (WCAG 2). | `npm install -g pa11y`<br>`pa11y https://docentdavid.github.io/madeira/` |
| [axe-core](https://github.com/dequelabs/axe-core) | De meest gebruikte regelset voor toegankelijkheid. Zit ook in Lighthouse en in de browserextensie *axe DevTools*. | `pa11y --runner axe <url>` |
| [WAVE](https://wave.webaim.org/) | Laat fouten en aandachtspunten zien als icoontjes óp de pagina. Ook handig voor de kopstructuur en de leesvolgorde. | Plak de URL op de site, of gebruik de browserextensie. |
| [Lighthouse](https://developer.chrome.com/docs/lighthouse) | Scores voor Performance, Accessibility, Best Practices en SEO. | Chrome DevTools → tab *Lighthouse*, of `npm install -g lighthouse` en dan `lighthouse <url> --form-factor=mobile` |

---

## 2. Toegankelijkheid

| Tool | Wat het extra doet | Wanneer gebruiken |
|---|---|---|
| [IBM Equal Access Accessibility Checker](https://www.ibm.com/able/toolkit/tools/) | Een eigen regelset, los van axe en WAVE, dus het vindt soms andere dingen. Er is een browserextensie en een terminalversie (`accessibility-checker`). | Als derde mening naast axe en WAVE. |
| [ARC Toolkit](https://www.tpgi.com/arc-platform/arc-toolkit/) (TPGi) | Browserextensie die precies toont wat een screenreader voorleest, zoals koppen, namen van links en knoppen, en ARIA. | Bij knoppen met alleen een icoon, verborgen teksten en ARIA-attributen. |
| [Accessibility Insights](https://accessibilityinsights.io/) (Microsoft) | Begeleidt je stap voor stap door een handmatige test. Met *Tab stops* zie je de tabvolgorde getekend op de pagina. | Voor een volledige WCAG-controle met handmatige onderdelen. |
| **VoiceOver** (macOS, iOS), **TalkBack** (Android), [NVDA](https://www.nvaccess.org/) (Windows) | Echte screenreaders. | Altijd bij belangrijke onderdelen. Zo merk je wat een blinde of slechtziende gebruiker echt ervaart. |
| [Polypane](https://polypane.app/) | Browser voor ontwikkelaars die meerdere schermformaten tegelijk toont en kleurenblindheid nabootst. | Responsief ontwerp en kleurgebruik controleren. |
| [Sim Daltonism](https://michelf.ca/projects/sim-daltonism/) (macOS) | Bootst kleurenblindheid na voor alles op je scherm. | Kaarten, grafieken en alles waarbij kleur informatie draagt. |
| [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) | Berekent de contrastverhouding tussen twee kleuren. | Bij het kiezen van kleuren (minimaal 4,5 : 1 voor gewone tekst). |
| [Stark](https://www.getstark.co/) | Controleert contrast en kleurenblindheid al in het ontwerp, bijvoorbeeld in Figma. | In de ontwerpfase, vóór er code is. |

**Handmatige checklist (vijf minuten):**
- Kun je alles bedienen met alleen het toetsenbord (Tab, Shift+Tab, Enter, spatie, Esc)?
- Zie je altijd waar de focus staat?
- Blijft de pagina bruikbaar bij 200% zoom en op 320 px breed?
- Is de volgorde van de koppen logisch (h1, dan h2, dan h3)?
- Werkt de site met de donkere modus en met *reduced motion*?

---

## 3. Prestaties en PWA

| Tool | Wat het doet | Wanneer gebruiken |
|---|---|---|
| [PageSpeed Insights](https://pagespeed.web.dev/) | Lighthouse plus metingen van echte Chrome-gebruikers (Core Web Vitals uit het CrUX-rapport). | Bij een site met veel bezoekers: dan zie je echte metingen naast die van het lab. |
| [WebPageTest](https://www.webpagetest.org/) | Test op echte toestellen en trage netwerken, met een filmstrip en een watervalgrafiek. | Om te zien wát er traag laadt en in welke volgorde. |
| [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) | Draait Lighthouse automatisch en kan een minimumscore afdwingen. | In een CI-pipeline, zodat de score niet ongemerkt daalt. |
| [Unlighthouse](https://unlighthouse.dev/) | Draait Lighthouse op alle pagina's van een site tegelijk. | Bij sites met veel pagina's. |
| **Chrome DevTools → Application** | De service worker, de cache, het manifest en de opslag bekijken. Met *Offline* aan test je offline gebruik. | Bij elke PWA. |
| **Chrome DevTools → Network en Performance** | Trage netwerken nabootsen, laadtijd en blokkerende scripts analyseren. | Bij het optimaliseren van de snelheid. |
| [PWABuilder](https://www.pwabuilder.com/) (Microsoft) | Beoordeelt het manifest en de service worker, en kan app-pakketten maken voor de Play Store, Microsoft Store en App Store. | Om je PWA compleet te maken of te publiceren. |
| [Workbox](https://developer.chrome.com/docs/workbox) (Google) | Bibliotheek met kant-en-klare cacheregels voor service workers. | Bij grotere PWA's. Een kleine site kan prima met een eigen `sw.js`, zoals deze reisgids. |
| [Squoosh](https://squoosh.app/) | Afbeeldingen verkleinen en omzetten naar WebP of AVIF. | Bij elke afbeelding die je online zet. |

---

## 4. Code, HTML en beveiliging

| Tool | Wat het doet | Wanneer gebruiken |
|---|---|---|
| [W3C Nu HTML Checker](https://validator.w3.org/nu/) | Controleert of je HTML geldig is. Geldige HTML is ook beter voor screenreaders. Kan ook in de terminal (`vnu`). | Bij elke oplevering. |
| [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) | Controleert of je CSS geldig is. | Bij vreemde opmaakproblemen. |
| [ESLint](https://eslint.org/) | Vindt fouten en slordigheden in JavaScript. | Tijdens het programmeren, in je editor. |
| [Stylelint](https://stylelint.io/) | Vindt fouten en slordigheden in CSS. | Tijdens het programmeren, in je editor. |
| [Prettier](https://prettier.io/) | Maakt de opmaak van de code automatisch gelijk. | In teams, zodat iedereen dezelfde stijl gebruikt. |
| [linkinator](https://github.com/JustinBeckwith/linkinator) | Zoekt kapotte links, zowel interne als externe. | Bij sites met veel externe links. `npx linkinator <url>` |
| [Mozilla HTTP Observatory](https://developer.mozilla.org/en-US/observatory) | Controleert de beveiligingsheaders, zoals Content-Security-Policy en HSTS. | Vóór je een site live zet. |
| [securityheaders.com](https://securityheaders.com/) | Snel overzicht van de beveiligingsheaders, met een cijfer. | Als snelle controle. |
| [SSL Labs](https://www.ssllabs.com/ssltest/) | Controleert de HTTPS-instellingen van de server. | Bij een eigen server of domein. |
| `npm audit` | Zoekt bekende beveiligingslekken in je npm-pakketten. | Bij elk project met een `package.json`. |

---

## 5. Automatisch testen in de browser

Tools als pa11y testen alleen de pagina zoals hij laadt. De tools hieronder kunnen ook **klikken, typen en navigeren**, en daarna opnieuw testen. Zo test je ook een geopend menu, een formulier met een foutmelding of de donkere modus.

| Tool | Wat het doet |
|---|---|
| [Playwright](https://playwright.dev/) | Bestuurt Chromium, Firefox en WebKit (de engine van Safari). Kan ook telefoons nabootsen. |
| [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) | Draait axe binnen een Playwright-test, ook na een klik. |
| [Cypress](https://www.cypress.io/) met [cypress-axe](https://github.com/component-driven/cypress-axe) | Hetzelfde idee, met een andere werkwijze en een visuele testrunner. |
| **Visuele regressietests**: [Playwright screenshots](https://playwright.dev/docs/test-snapshots), [BackstopJS](https://github.com/garris/BackstopJS), [Percy](https://percy.io/) | Vergelijken schermafbeeldingen voor en na een wijziging. Zo zie je meteen of het uiterlijk onbedoeld is veranderd. |

Voorbeeld met Playwright en axe:

```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('kaart in groot scherm is toegankelijk', async ({ page }) => {
  await page.goto('https://docentdavid.github.io/madeira/#dag18');
  await page.getByRole('button', { name: 'Groot scherm' }).first().click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

---

## 6. Specifiek voor React en Next.js

| Tool | Wat het doet | Wanneer gebruiken |
|---|---|---|
| [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) | Meldt toegankelijkheidsfouten al tijdens het typen, zoals een ontbrekende `alt` of een klikbare `div`. Zit standaard in Next.js. | Altijd. |
| [@axe-core/react](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/react) | Toont axe-meldingen in de browserconsole tijdens het ontwikkelen. | Tijdens het ontwikkelen. |
| [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Componenttests die zoeken zoals een gebruiker: op rol en zichtbare tekst. Dat dwingt je tot toegankelijke HTML. | Bij elk component met interactie. |
| [jest-axe](https://github.com/nickcolley/jest-axe) / [vitest-axe](https://github.com/chaance/vitest-axe) | axe-controle binnen je unit tests. | Samen met React Testing Library. |
| [Storybook](https://storybook.js.org/) met [addon-a11y](https://storybook.js.org/addons/@storybook/addon-a11y) | Elk component apart bekijken en testen, inclusief toegankelijkheid. | Bij een componentenbibliotheek of design system. |
| [React DevTools](https://react.dev/learn/react-developer-tools) (Profiler) | Laat zien welke componenten onnodig opnieuw renderen en hoe lang dat duurt. | Bij een trage interface. |
| [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer) | Toont welke pakketten je JavaScript-bundel groot maken. | Als Lighthouse "Reduce unused JavaScript" meldt. |
| [Next.js `useReportWebVitals`](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals) / [Vercel Speed Insights](https://vercel.com/docs/speed-insights) | Meten de Core Web Vitals bij echte bezoekers. | Na livegang. |
| [Serwist](https://serwist.pages.dev/) / [next-pwa](https://github.com/shadowwalker/next-pwa) | PWA-ondersteuning (service worker en offline) voor Next.js, gebouwd op Workbox. | Als je van een Next.js-app een PWA wilt maken. |

---

## 7. Alles automatisch bij elke push

Met **GitHub Actions** kun je de tests bij elke push laten draaien. Gaat er iets mis, dan zie je een rood kruisje bij de commit. Een voorbeeld (`.github/workflows/test.yml`):

```yaml
name: Testen
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx http-server -p 8080 -s &
      - run: npx pa11y http://localhost:8080/
      - run: npx pa11y --runner axe http://localhost:8080/
      - run: npx linkinator http://localhost:8080/ --skip "google.com"
      - run: npx @lhci/cli autorun --collect.url=http://localhost:8080/
```

De tools worden alleen in de pipeline geïnstalleerd, dus er komt geen `node_modules` in je repository.

---

## 8. Welke tool wanneer?

| Moment | Tools |
|---|---|
| **Ontwerpen** | Stark, WebAIM Contrast Checker, Sim Daltonism |
| **Programmeren** | ESLint (met jsx-a11y), Stylelint, Prettier, @axe-core/react, axe DevTools-extensie |
| **Testen voor oplevering** | pa11y, axe, WAVE, Lighthouse, W3C-validator, linkinator, handmatig met toetsenbord en screenreader |
| **Interactie testen** | Playwright of Cypress met axe, visuele regressietests |
| **PWA controleren** | Chrome DevTools → Application, PWABuilder, Lighthouse |
| **Na livegang** | PageSpeed Insights, WebPageTest, Mozilla HTTP Observatory, Vercel Speed Insights |
| **Doorlopend** | GitHub Actions met Lighthouse CI, pa11y en linkinator |
