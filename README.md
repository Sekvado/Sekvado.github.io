# Sekvado.github.io

The Sekvado landing page, served by GitHub Pages at <https://www.sekvado.com>.
Static HTML/CSS/JS — no build step, no framework. Push to `master` and GitHub
Pages deploys it.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | The landing page |
| `privacy.html` | Privacy notice for the signup list — **still contains `[ ]` placeholders** |
| `404.html` | Not-found page |
| `assets/css/main.css` | The stylesheet that is actually served |
| `assets/sass/` | SCSS sources for the same stylesheet (see the caveat below) |
| `assets/js/main.js` | Background slideshow + signup form submission |
| `images/`, `favicon.*`, `site.webmanifest` | Brand assets from the Sekvado identity package |

The template underneath is [Eventually by HTML5 UP](https://html5up.net), used
under CC BY 3.0 — keep the credit in the footer, or buy the license to remove it.

## Turning on the signup form

The form does **not** store addresses yet. `index.html` has
`REPLACE_WITH_SIGNUP_ENDPOINT` in two places on the `<form>` element:

```html
<form id="signup-form" method="post" action="…" data-endpoint="…">
```

Put your mailing-list provider's POST endpoint in both (Buttondown, Formspree,
ConvertKit and MailerLite all accept a plain form POST with an `email` field).
`data-endpoint` is used for the background submission; `action` is the fallback
for browsers without `fetch`, and for anyone with JavaScript disabled.

Until it is configured the form tells the visitor that signup isn't live rather
than showing a fake "Thank you!" — do not remove that guard by faking success.

Whoever you pick becomes a GDPR data processor: sign their DPA and fill in
`privacy.html` before the form goes live.

## CSS caveat

`assets/css/main.css` is **not** generated from `assets/sass/` in CI, and the
committed CSS predates the current sources. If you change SCSS, mirror the change
in the matching block at the end of `main.css` (the Sekvado additions are marked).
To move to a real build instead:

```bash
npx sass --no-source-map assets/sass/main.scss assets/css/main.css
```

Check the result before committing — the sources use deprecated Sass functions and
the output will differ from the file that is being served today.

## Domain

`CNAME` holds exactly one domain (`www.sekvado.com`) — GitHub Pages supports one
per repository, and a second line breaks TLS certificate provisioning.
`sekvado.dk` / `www.sekvado.dk` should be redirected to `.com` at the registrar.
