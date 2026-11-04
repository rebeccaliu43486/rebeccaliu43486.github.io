# AGENTS.md

Guide for AI coding agents, and people, editing this site. Read all of it before changing anything.

## What this is

A one-page academic homepage for Rebecca Jiaxiu Liu, PhD student in Finance at the National University of Singapore. It is meant to be served by GitHub Pages from the root of the `main` branch. There is no build step, no package manager and no framework.

| File | Role |
| --- | --- |
| `index.html` | Page metadata, the page shell, then the **CONTENT** block (settings JSON and `<div id="source">`), then `<script src="assets/site.js">`. |
| `assets/site.js` | The engine. It reads `#site` and `#source`, renders every section, and adds the interactions. Content changes never need it. |
| `assets/site.css` | All styles. Colour tokens sit on `:root`, with a light theme ("Kopi") and a dark theme ("Kopi-O"). |
| `assets/img/` | `shsid.png` and `raffles.png` (the school logos, 216 px tall, palette PNGs), and an optional photo. |
| `cv.pdf`, `papers/` | Not added yet. The CV and paper PDFs go at the root. |

The design idea: research topics are metro lines in Singapore's MRT palette and papers are stations on them, drawn as a line map. The Path section is a route through the owner's cities (Shanghai, Singapore, Oxford, Hong Kong, London, Stanford), each with a line drawing and a street plate in that city's sign style.

## Most edits are content edits

Change the CONTENT block in `index.html`. The engine builds everything from it. Each block has a comment above it in `index.html` that lists its attributes.

| Block | Markup | Main attributes |
| --- | --- | --- |
| Settings | `<script type="application/json" id="site">` | `preview`, `name`, `role`, `institution`, `facts`, `fields`, `expected`, `onMarket`, `marketYear`, `photo`, `cv` (`url`, `updated`; an empty `url` hides every CV link), `email`, `office`, `timezone`, `updated`, `profiles` |
| Bio | `<div data-block="bio">` | 2–4 sentences in the first person |
| Research lines | `<ol data-block="topics">` | `data-id`, `data-code` (two letters), `data-blurb`; at most 6 lines |
| Papers | `<article class="paper" id="…">` | `data-status`, `data-date` (YYYY-MM), `data-topics` (main line first), `data-short`, `data-fig`, `data-version`, `data-stage`, `data-journal`, `data-volume`, `data-pages`, `data-doi`; own name in `<b>`, coauthors in `<a>` |
| Research experience | `<ol data-block="research">`: one `<li>` per role, newest first, with a `<ul>` of projects inside | `data-start`, `data-end`, `data-role`, `data-place`, `data-with`, `data-project`, `data-datasets` |
| Skills | `<ul data-block="skills">` | `data-label` on each line |
| News, Code, Teaching, Service, Talks, Awards | `<ul data-block="…">`, one `<li>` per entry | News shows the 4 newest items from the last 12 months; talks dated after today show as Scheduled |
| Path | `<ol data-block="path">`, oldest first | `data-city` (`singapore`, `shanghai`, `hongkong`, `london`, `oxford`, `stanford`), `data-kind` (`degree`, `work`, `internship`, `exchange`, `visiting`, `school`), `data-start`, `data-end`, `data-role`, `data-place`, `data-note`, `data-logo`, `data-logo-alt`, and per city: `data-street` + `data-street-local` (Shanghai, Hong Kong), `data-street` + `data-district` (London), `data-board` (Oxford, Stanford) |
| References | `<ul data-block="references">` | Shown only while `onMarket` is true |

Station codes (BK1, IN2, …) are numbered by date along each line. Adding an older paper renumbers the newer ones on that line. To withdraw a paper, keep it with `data-hidden` so the other codes stay put.

**Copies outside the CONTENT block.** The `<title>`, description, `og:` tags and JSON-LD at the top of `index.html`, and the `<noscript>` header after `<main>`, repeat the name, role, the bio's first sentences, email and real profile links. The engine never updates them. When any of those change, update the copies too.

### Templates and preview

- Each placeholder entry carries `data-template` (an `<article>`, an `<li>`, or the placement `<p>`). Templates render only while `"preview": true`, with a Template badge on their section heading. With `"preview": false` the engine removes them before rendering.
- When the owner gives you real content, replace the placeholders and remove `data-template` from the entries you keep. Real and placeholder entries can share a list.
- In preview, every link that is not a full web address (`https://…` or `mailto:`) shows a "sample link" notice instead of opening, including `cv.pdf` and `papers/…`. Profile links set to `"#"` show only in preview.
- While `preview` is true, the engine adds `<meta name="robots" content="noindex">`.

## Rules

1. **Never invent facts.** No made-up papers, coauthors, venues, dates, awards or links. If something is unknown, leave a template entry or ask the owner.
2. **The schools.** SHSID (Shanghai) and Raffles Institution (Singapore) appear on the Path only as a logo plus the city, with no years and no school name in visible text. The name stays in the logo's alt text. Do not restate them the way the universities are stated.
3. **Privacy.** No phone number, home address, or health or medical information anywhere in the repository: not on the page, in `cv.pdf` or other PDFs, in image metadata or in the commit history, even when a source document such as the CV has them.
4. **The site is a selection from the CV, not a copy.** Leave CV items off unless the owner asks for them.
5. **Choices that differ from the CV on purpose.** Spellings: Wójcik (his name; the CV has Wojcik) and Euronext. Merton award years: Final Honours School Exams Award 2023 (finals), Exhibition Scholarship 2021 (Preliminary Examinations, end of the first year), Fowler Prize 2020–23; the CV groups them under 2020–2023.
6. **Colour is data.** Saturated colour only marks research lines (`--l1` to `--l8`, from the MRT palette). Keep the red and green lines apart.
7. **Plates never overstate.** Exchange and visiting stops say so, the Stanford plate never carries a year, and street plates use real streets only.
8. **One fast, accessible page.** No frameworks, trackers or third-party images. Fonts come from Google Fonts only. Keep the focus styles, the ARIA labels, keyboard support on the map, the `prefers-reduced-motion` and `forced-colors` rules, and both themes.
9. **Write plainly.** British spelling, sentence-case headings, short sentences.
10. **Chinese and Tamil characters.** The Noto font link near the top of `index.html` loads only the characters listed in its `text=` value. If you add Chinese or Tamil text, add those characters there (URL-encoded), or they fall back to system fonts.
11. **Cache.** When you change `assets/site.css` or `assets/site.js`, bump the `?v=` value on both links in `index.html`.

## Checking a change

1. Open `index.html` in a browser; no server is needed.
2. Read the console. The engine reports content problems as `[site]` warnings: broken settings JSON (also shown as a red line at the top of the page), unknown topic, duplicate id, missing date.
3. Check widths of 320, 390, 820 and 1280 px. Nothing should scroll sideways, the navigation collapses to Menu when it does not fit (and always at 480 px and below), and the map turns vertical below 560 px.
4. Check the dark theme (the Kopi-O switch) and the keyboard: Tab through the page; on the map, the arrow keys move between stations and Enter opens one.
5. Before going public: a public `cv.pdf` is in the repository, or the `cv` setting's `url` is `""`. Then set `"preview": false` and check that no Template badges, "Title of…" entries or `#` links remain.

## Deploying

The repository is `rebeccaliu43486/rebeccaliu43486.github.io` (renamed from `rebeccaliu.github.io`), so GitHub Pages serves it at https://rebeccaliu43486.github.io/ from the root of `main`. Each push to `main` updates the site within a few minutes, and `.nojekyll` turns off Jekyll processing. Keep every link and asset path relative (`assets/site.css`, not `/assets/site.css`), so the site also works under a path or on a custom domain.
