# Rebecca Jiaxiu Liu: academic homepage

This repository is the whole website. There is no build step: `index.html` is the page, and `assets/` holds its styles (`site.css`), the script that draws it (`site.js`) and its images (`img/`). To preview it, download the repository and open `index.html` in a browser.

## What to edit

Everything you change is in the **CONTENT** block of `index.html`, between the `CONTENT` comment and the `<script src="assets/site.js">` line at the bottom.

- **Settings** sit in `<script type="application/json" id="site">`. The block is JSON, so keep every quote and comma. If one is wrong, a red error line appears at the top of the page and default settings are used until you fix it, so check the page before you push.
- **Templates.** Papers, News, Code, Teaching, Talks and References hold placeholder entries marked `data-template`. Replace them with your own, and delete `data-template` from each entry you keep.
- **Copies at the top.** If you change your name, role, the first sentences of your bio, your email or your profile links, also update the copies near the top of `index.html`: the `<title>`, the description and `og:` lines, the JSON-LD block, and the `<noscript>` header just after `<main>`. Search engines and link previews read those.
- **Going public.** Add a public `cv.pdf` first (or set `"url": ""` in the `cv` setting to hide the CV links), then set `"preview": false`. Anything still marked `data-template` then hides itself, profile links still set to `"#"` disappear, and the "sample link" notices stop. While `preview` is `true`, the page also asks search engines not to index it.

## Files to add

| File | What it is |
| --- | --- |
| `cv.pdf` | A public version of your CV, without your phone number or other private details. Put it at the top level next to `index.html`, then set `"url": "cv.pdf"` (and `"updated"`) in the `cv` setting: until then the CV links stay hidden. Overwrite the file in place when you update it, so the link never breaks. |
| `papers/…` | Your paper PDFs, linked from each paper's PDF button. |

Your photo (`assets/img/photo.jpg`, a 3:4 portrait, 600 × 800 px) and the school logos for the Path (`shsid.png` and `raffles.png`) are already in `assets/img/`. To change the photo, replace `photo.jpg` with another 3:4 portrait of about the same size.

## Publishing on GitHub Pages (free)

This repository is named after your account (`rebeccaliu43486.github.io`), so GitHub serves it at **https://rebeccaliu43486.github.io**. GitHub usually turns a repository with that name into a site as soon as it has content. To check, or to switch it on:

1. In the repository on GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
3. After a few minutes the site is online. Every later commit to `main` updates it.

A repository with any other name is served under its name instead, for example `https://rebeccaliu43486.github.io/rebeccaliu.github.io/`. The site works at either address, because all its links are relative.

Hosting is free. A custom domain such as `rebeccaliu.com` is optional, about US$10–20 a year from a domain registrar. It keeps your address even if you later move the site off GitHub or rename your account. To set one up:

1. Verify the domain: your GitHub profile's **Settings → Pages → Add a domain**.
2. At your registrar, add the DNS records GitHub lists: A and AAAA records for `rebeccaliu.com`, or a CNAME record pointing `www` to `rebeccaliu43486.github.io`.
3. Only then enter the domain under the repository's **Settings → Pages → Custom domain**, and tick **Enforce HTTPS**.

## Editing later with an AI assistant

Give the assistant this repository. `AGENTS.md` explains the content model, the design rules and how to check the page, and `CLAUDE.md` points Claude to it.
