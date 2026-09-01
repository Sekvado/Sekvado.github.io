# Sekvado.github.io

The Sekvado landing page, served by GitHub Pages at <https://www.sekvado.com>.
Static HTML/CSS/JS — no build step, no framework. Push to `master` and GitHub
Pages deploys it.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | The landing page |
| `404.html` | Not-found page |
| `assets/css/main.css` | The stylesheet that is actually served |
| `assets/sass/` | SCSS sources for the same stylesheet (see the caveat below) |
| `assets/js/main.js` | Background slideshow |
| `images/`, `favicon.*`, `site.webmanifest` | Brand assets from the Sekvado identity package |
| `assets/fonts/` | Outfit and Manrope as variable woff2, self-hosted (SIL OFL 1.1) |

The template underneath is [Eventually by HTML5 UP](https://html5up.net), which
is CC BY 3.0: free to use as long as the credit stays in the footer, or you buy
the licence that removes that condition. The credit is in the footer — leave it
there unless someone buys the licence at html5up.net.

## No signup form

The page collects nothing: no form, no cookies, no analytics, and not a single
third-party request — fonts and icons are served from this repository. That is
why there is no privacy notice. If you bring a signup form back you need one
again, plus a consent checkbox and a data processing agreement with the
mailing-list provider.

A working form (background POST to a configurable endpoint, no-JS fallback,
consent checkbox, aria-live status) and a privacy-notice draft are in the git
history if you want them back:

```bash
git show a6f6f3d:index.html
git show a6f6f3d:privacy.html
```

The template's `#signup-form` CSS rules are still in `assets/css/main.css`; they
are dead but harmless, and left alone to keep the vendored template intact.

## Building the stylesheet

`assets/css/main.css` is generated — **do not edit it by hand.** Change the SCSS
in `assets/sass/` and rebuild:

```bash
npm install && npm run build:css
```

`npm run watch:css` rebuilds on save. Commit the generated `main.css` along with
the sources; GitHub Pages serves the file as-is and runs no build of its own.

The sources use `@import` and a few deprecated Sass colour functions, so the
build prints deprecation warnings. They are harmless with Dart Sass 1.x; they
become errors in Sass 3, at which point the template needs migrating to `@use`.

## Visual identity

The page follows the Sekvado identity package (`sekvado-identitet`, August 2026).

**Colour.** The tokens live once, in `assets/sass/libs/_vars.scss`, and
`assets/sass/base/_tokens.scss` re-publishes them as CSS custom properties
(`--rose`, `--ink`, `--mennesker`, `--radius-l`, …) with the same names the rest
of the product uses. The page is a dark surface — the identity's "stage.dark"
treatment: Ink `#17181C` ground, Paper `#F7F7F4` text. Ink replaces black and
Paper replaces white; neither `#000` nor `#fff` is used as a surface. The
template's own teal accent is gone, replaced by Rose for primary accents, Leaf
for positive and Rose strong for negative states. Colour roles are fixed: Rose =
people and community, Leaf = activities and volunteering, Sky = organisation and
finance. Do not swap them.

**Type.** Outfit 700 in small caps with +1% tracking and 1.05 leading for
headings; Manrope 400 at 1.55 leading for body copy; the hero paragraph is the
lead style, 1.15em at 1.5. Both are variable woff2 in `assets/fonts/` under SIL
OFL 1.1, so there is no Google Fonts request. Outfit is never used for running
text, per the identity.

**Focus.** 3px Sky outline at 3px offset, as the identity specifies.

**Logo.** The stacked lockup with the white wordmark, on Ink — one of the three
backgrounds the identity allows full colour on. Font Awesome is gone; the footer
holds nothing but the template credit, and the page has no other links.

## Domain

`CNAME` holds exactly one domain (`www.sekvado.com`) — GitHub Pages supports one
per repository, and a second line breaks TLS certificate provisioning.
`sekvado.dk` / `www.sekvado.dk` should be redirected to `.com` at the registrar.
