# Testtools voor websites en PWA's

Een overzicht van tools om een website of Progressive Web App (PWA) te controleren op toegankelijkheid, snelheid, kwaliteit en beveiliging. Per tool staat wat hij doet en wanneer je hem gebruikt. Beweringen zijn onderbouwd met bronnen; de nummers tussen haken, zoals [1], verwijzen naar de [bronnenlijst](#bronnen) onderaan.

> **Let op:** automatische tools vinden maar een deel van de toegankelijkheidsproblemen. Afhankelijk van het onderzoek en de manier van tellen is dat ongeveer 40% tot 57% [3] [4]. Handmatig testen met toetsenbord en screenreader blijft dus nodig [2].

## Inhoud

0. [Waarom testen? Wat zegt onderzoek](#0-waarom-testen-wat-zegt-onderzoek)
1. [De basis](#1-de-basis)
2. [Toegankelijkheid](#2-toegankelijkheid)
3. [Prestaties en PWA](#3-prestaties-en-pwa)
4. [Code, HTML en beveiliging](#4-code-html-en-beveiliging)
5. [Automatisch testen in de browser](#5-automatisch-testen-in-de-browser)
6. [Specifiek voor React en Next.js](#6-specifiek-voor-react-en-nextjs)
7. [Alles automatisch bij elke push](#7-alles-automatisch-bij-elke-push)
8. [Welke tool wanneer?](#8-welke-tool-wanneer)
9. [Bronnen](#bronnen)

---

## 0. Waarom testen? Wat zegt onderzoek

**De meeste websites zijn niet toegankelijk.** WebAIM test elk jaar de homepages van de 1 miljoen meest bezochte websites. In 2026 had 95,9% van die pagina's fouten die automatisch tegen WCAG 2 te detecteren zijn. De meest voorkomende fout was te weinig contrast in tekst (83,9% van de pagina's) [5].

**Eén tool is niet genoeg.** De Britse overheid (GDS) testte tien automatische tools op een pagina met 143 bewust ingebouwde toegankelijkheidsfouten. 42 daarvan (29%) werden door geen enkele tool gevonden. De beste tools vonden 37% (alleen fouten en waarschuwingen) tot 41% (inclusief meldingen die om handmatige controle vragen) [3]. Deque, de maker van axe, rapporteert dat automatische tests 57% van de problemen vinden. Deque telt daarbij het aantal gevonden fouten in plaats van het aantal WCAG-criteria, en het gaat om eigen onderzoek van de leverancier [4]. Het W3C zegt het zo: tools helpen je mogelijke problemen snel te vinden, maar kunnen niet zelf bepalen of een site toegankelijk is. Daar is menselijk oordeel voor nodig [2].

**Screenreaders worden vooral mobiel gebruikt.** In het onderzoek van WebAIM onder 1.539 screenreadergebruikers gebruikt 91,3% ook een screenreader op een telefoon of tablet, en 70,6% heeft als belangrijkste mobiele toestel een iPhone of iPad [6]. Test daarom ook met VoiceOver op iOS en TalkBack op Android.

**Snelheid heeft direct effect.** In een onderzoek van Deloitte (in opdracht van Google) onder 37 merken leverde 0,1 seconde snellere mobiele laadtijd 8,4% meer conversie op bij webwinkels en 10,1% bij reiswebsites [14].

**Het is ook wettelijk verplicht.** Voor Nederlandse overheidswebsites en -apps geldt een toegankelijkheidsverplichting volgens de Europese norm (EN 301 549, gebaseerd op WCAG) [20]. Sinds 28 juni 2025 geldt via de Europese Toegankelijkheidsrichtlijn (European Accessibility Act) ook voor veel commerciële diensten, zoals webwinkels en bankieren, een toegankelijkheidseis [19].

---

## 1. De basis

Met deze vier tools begin je. Ze vullen elkaar aan: elke tool vindt net andere problemen [3].

| Tool | Waarvoor | Hoe |
|---|---|---|
| [pa11y](https://pa11y.org/) | Toegankelijkheid testen vanaf de terminal, standaard met de regels van HTML_CodeSniffer (WCAG 2). | `npm install -g pa11y`<br>`pa11y https://example.com/` |
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
| **VoiceOver** (macOS, iOS), **TalkBack** (Android), [NVDA](https://www.nvaccess.org/) (Windows) | Echte screenreaders. | Altijd bij belangrijke onderdelen. Zo merk je wat een blinde of slechtziende gebruiker echt ervaart. Test zeker ook mobiel [6]. |
| [Polypane](https://polypane.app/) | Browser voor ontwikkelaars die meerdere schermformaten tegelijk toont en kleurenblindheid nabootst. | Responsief ontwerp en kleurgebruik controleren. |
| [Sim Daltonism](https://michelf.ca/projects/sim-daltonism/) (macOS) | Bootst kleurenblindheid na voor alles op je scherm. | Kaarten, grafieken en alles waarbij kleur informatie draagt. |
| [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) | Berekent de contrastverhouding tussen twee kleuren. | Bij het kiezen van kleuren (minimaal 4,5 : 1 voor gewone tekst en 3 : 1 voor grote tekst) [8]. |
| [Stark](https://www.getstark.co/) | Controleert contrast en kleurenblindheid al in het ontwerp, bijvoorbeeld in Figma. | In de ontwerpfase, vóór er code is. |

**Handmatige checklist (vijf minuten)**, gebaseerd op de *Easy Checks* van het W3C [7]:
- Kun je alles bedienen met alleen het toetsenbord (Tab, Shift+Tab, Enter, spatie, Esc)? [1]
- Zie je altijd waar de focus staat? [1]
- Is de tekst nog te lezen bij 200% vergroting [9], en werkt de pagina op 320 px breed zonder dat je zijwaarts hoeft te scrollen [10]?
- Is de volgorde van de koppen logisch (h1, dan h2, dan h3)? [7]
- Wordt informatie niet alleen met kleur aangegeven, bijvoorbeeld bij routes, grafieken of foutmeldingen? [11]
- Werkt de site met de donkere modus en met *reduced motion*?

Voor een volledig onderzoek van een hele website beschrijft het W3C een vaste werkwijze: WCAG-EM [12].

---

## 3. Prestaties en PWA

| Tool | Wat het doet | Wanneer gebruiken |
|---|---|---|
| [PageSpeed Insights](https://pagespeed.web.dev/) | Lighthouse plus metingen van echte Chrome-gebruikers (Core Web Vitals uit het CrUX-rapport) [15]. | Bij een site met veel bezoekers: dan zie je echte metingen naast die van het lab. Labmetingen en veldmetingen kunnen flink verschillen [16]. |
| [WebPageTest](https://www.webpagetest.org/) | Test op echte toestellen en trage netwerken, met een filmstrip en een watervalgrafiek. | Om te zien wát er traag laadt en in welke volgorde. |
| [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) | Draait Lighthouse automatisch en kan een minimumscore afdwingen. | In een CI-pipeline, zodat de score niet ongemerkt daalt. |
| [Unlighthouse](https://unlighthouse.dev/) | Draait Lighthouse op alle pagina's van een site tegelijk. | Bij sites met veel pagina's. |
| **Chrome DevTools → Application** | De service worker, de cache, het manifest en de opslag bekijken. Met *Offline* aan test je offline gebruik. | Bij elke PWA [17]. |
| **Chrome DevTools → Network en Performance** | Trage netwerken nabootsen, laadtijd en blokkerende scripts analyseren. | Bij het optimaliseren van de snelheid. |
| [PWABuilder](https://www.pwabuilder.com/) (Microsoft) | Beoordeelt het manifest en de service worker, en kan app-pakketten maken voor de Play Store, Microsoft Store en App Store. | Om je PWA compleet te maken of te publiceren. |
| [Workbox](https://developer.chrome.com/docs/workbox) (Google) | Bibliotheek met kant-en-klare cacheregels voor service workers. | Bij grotere PWA's. Voor een kleine site volstaat vaak een eigen, korte `sw.js`. |
| [Squoosh](https://squoosh.app/) | Afbeeldingen verkleinen en omzetten naar WebP of AVIF. | Bij elke afbeelding die je online zet. |

---

## 4. Code, HTML en beveiliging

| Tool | Wat het doet | Wanneer gebruiken |
|---|---|---|
| [W3C Nu HTML Checker](https://validator.w3.org/nu/) | Controleert of je HTML geldig is. Kan ook in de terminal (`vnu`). Let op: in WCAG 2.2 is geldige HTML (criterium 4.1.1 *Parsing*) geen eis meer, omdat moderne browsers en screenreaders goed met kleine fouten omgaan. Het W3C noemt het controleren en oplossen van zulke fouten wel nuttig [13]. | Bij elke oplevering. |
| [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) | Controleert of je CSS geldig is. | Bij vreemde opmaakproblemen. |
| [ESLint](https://eslint.org/) | Vindt fouten en slordigheden in JavaScript. | Tijdens het programmeren, in je editor. |
| [Stylelint](https://stylelint.io/) | Vindt fouten en slordigheden in CSS. | Tijdens het programmeren, in je editor. |
| [Prettier](https://prettier.io/) | Maakt de opmaak van de code automatisch gelijk. | In teams, zodat iedereen dezelfde stijl gebruikt. |
| [linkinator](https://github.com/JustinBeckwith/linkinator) | Zoekt kapotte links, zowel interne als externe. | Bij sites met veel (externe) links. `npx linkinator <url>` |
| [Mozilla HTTP Observatory](https://developer.mozilla.org/en-US/observatory) | Controleert de beveiligingsheaders, zoals Content-Security-Policy en HSTS. Welke headers je nodig hebt, staat bij het OWASP Secure Headers Project [18]. | Vóór je een site live zet. |
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

test('geopend menu is toegankelijk', async ({ page }) => {
  await page.goto('https://example.com/');
  await page.getByRole('button', { name: 'Menu' }).click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

---

## 6. Specifiek voor React en Next.js

| Tool | Wat het doet | Wanneer gebruiken |
|---|---|---|
| [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) | Meldt toegankelijkheidsfouten al tijdens het typen, zoals een ontbrekende `alt` of een klikbare `div`. Zit standaard in de ESLint-configuratie van Next.js [22]. | Altijd. |
| [@axe-core/react](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/react) | Toont axe-meldingen in de browserconsole tijdens het ontwikkelen. | Tijdens het ontwikkelen. |
| [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Componenttests die zoeken zoals een gebruiker: op rol en zichtbare tekst. Dat dwingt je tot toegankelijke HTML. Het uitgangspunt van de makers: hoe meer je tests lijken op hoe de software echt gebruikt wordt, hoe meer vertrouwen ze geven [21]. | Bij elk component met interactie. |
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

---

## Bronnen

- [1] W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C Recommendation. https://www.w3.org/TR/WCAG22/
- [2] W3C Web Accessibility Initiative. (z.d.). *Selecting Web Accessibility Evaluation Tools*. https://www.w3.org/WAI/test-evaluate/tools/selecting/
- [3] Duran, M. (2017, 24 februari). *What we found when we tested tools on the world's least-accessible webpage*. GOV.UK Accessibility Blog, Government Digital Service. https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/
- [4] Deque Systems. (2021). *Automated testing study identifies 57 percent of digital accessibility issues*. https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues/ (onderzoek door de leverancier van axe)
- [5] WebAIM. (2026). *The WebAIM Million: The 2026 report on the accessibility of the top 1,000,000 home pages*. https://webaim.org/projects/million/
- [6] WebAIM. (2024). *Screen Reader User Survey #10 Results*. https://webaim.org/projects/screenreadersurvey10/
- [7] W3C Web Accessibility Initiative. (z.d.). *Easy Checks – A First Review of Web Accessibility*. https://www.w3.org/WAI/test-evaluate/easy-checks/
- [8] W3C Web Accessibility Initiative. (z.d.). *Understanding Success Criterion 1.4.3: Contrast (Minimum)*. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
- [9] W3C Web Accessibility Initiative. (z.d.). *Understanding Success Criterion 1.4.4: Resize Text*. https://www.w3.org/WAI/WCAG22/Understanding/resize-text
- [10] W3C Web Accessibility Initiative. (z.d.). *Understanding Success Criterion 1.4.10: Reflow*. https://www.w3.org/WAI/WCAG22/Understanding/reflow
- [11] W3C Web Accessibility Initiative. (z.d.). *Understanding Success Criterion 1.4.1: Use of Color*. https://www.w3.org/WAI/WCAG22/Understanding/use-of-color
- [12] W3C. (2014). *Website Accessibility Conformance Evaluation Methodology (WCAG-EM) 1.0*. W3C Working Group Note. https://www.w3.org/TR/WCAG-EM/
- [13] W3C Web Accessibility Initiative. (z.d.). *Understanding Success Criterion 4.1.1: Parsing (obsolete and removed)*. https://www.w3.org/WAI/WCAG22/Understanding/parsing
- [14] Deloitte & Google. (2020). *Milliseconds make millions*. Samenvatting op web.dev: https://web.dev/case-studies/milliseconds-make-millions (onderzoek in opdracht van Google)
- [15] Google. (z.d.). *Web Vitals*. web.dev. https://web.dev/articles/vitals
- [16] Google. (z.d.). *Why lab and field data can be different (and what to do about it)*. web.dev. https://web.dev/articles/lab-and-field-data-differences
- [17] MDN Web Docs. (z.d.). *Progressive web apps*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- [18] OWASP. (z.d.). *OWASP Secure Headers Project*. https://owasp.org/www-project-secure-headers/
- [19] Europees Parlement en Raad. (2019). *Richtlijn (EU) 2019/882 betreffende de toegankelijkheidsvoorschriften voor producten en diensten* (European Accessibility Act). https://eur-lex.europa.eu/eli/dir/2019/882/oj
- [20] Rijksoverheid. (z.d.). *Digitoegankelijk*. https://www.digitoegankelijk.nl/
- [21] Testing Library. (z.d.). *Guiding Principles*. https://testing-library.com/docs/guiding-principles
- [22] Vercel. (z.d.). *Next.js: ESLint configuration*. https://nextjs.org/docs/app/api-reference/config/eslint

**Tip voor je eigen onderzoek:** kijk bij elke bron wie hem heeft gemaakt en waarom. Onderzoek van een leverancier (zoals Deque over axe, of Google over snelheid) kan waardevol zijn, maar is niet onafhankelijk. Vergelijk het daarom met onafhankelijke bronnen, zoals het W3C, overheden en WebAIM, en noem altijd het jaartal: tools en browsers veranderen snel.
