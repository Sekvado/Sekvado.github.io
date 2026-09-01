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

The template underneath is [Eventually by HTML5 UP](https://html5up.net), used
under CC BY 3.0 — keep the credit in the footer, or buy the license to remove it.

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

## CSS caveat

`assets/css/main.css` is **not** generated from `assets/sass/` in CI, and the
committed CSS predates the current sources. If you change SCSS, mirror the change
in the matching block in `main.css` (the Sekvado additions are marked: the
`@font-face` block at the top mirrors `components/_fonts.scss`, the block at the
end mirrors `components/_brand.scss`).
To move to a real build instead:

```bash
npx sass --no-source-map assets/sass/main.scss assets/css/main.css
```

Check the result before committing — the sources use deprecated Sass functions and
the output will differ from the file that is being served today.

## Typography and icons

Headings are Outfit 700 in small caps, body text is Manrope — the roles the
identity package defines. Both are variable woff2 served from `assets/fonts/`,
so there is no Google Fonts request. Font Awesome is gone; the two footer icons
are inline SVG.

## Domain

`CNAME` holds exactly one domain (`www.sekvado.com`) — GitHub Pages supports one
per repository, and a second line breaks TLS certificate provisioning.
`sekvado.dk` / `www.sekvado.dk` should be redirected to `.com` at the registrar.
