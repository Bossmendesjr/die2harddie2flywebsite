# Editing the Die2Hard website

## Where each part lives

| Part | Location | How changes go live |
| --- | --- | --- |
| Public website | https://github.com/Bossmendesjr/die2harddie2flywebsite | Commits to `main` trigger Vercel production deployments |
| Studio/backend and full platform source | https://github.com/Bossmendesjr/die2hard-platform | Render hosts Studio; automatic service deployments are off |
| Public website address | https://www.die2harddie2fly.com | The apex redirects here |
| Working Studio address during DNS propagation | https://die2hard-studio.onrender.com | Same Studio and database as the branded address |
| Branded Studio address | https://studio.die2harddie2fly.com | Namecheap DNS points it to Render |

For website edits, use the **die2harddie2flywebsite** repository. Its files are
at the repository root. In the full platform repository, those same files live
under `apps/web/`. Changing only the full platform repository does **not** deploy
the public website. Keep its `apps/web/` copy in sync when maintaining both.

## What to edit

| Change you want | File in the website repository |
| --- | --- |
| Homepage text and sections | `index.html` |
| Portuguese homepage | `pt/index.html` |
| Work archive layout | `work/index.html`, `pt/work/index.html` |
| Individual project page layout | `work/project.html`, `pt/work/project.html` |
| Services and descriptions | `services/index.html`, `pt/services/index.html` |
| About the collective / public Studio page | `studio/index.html`, `pt/studio/index.html` |
| Contact page text and fields | `contact/index.html`, `pt/contact/index.html` |
| Colours, fonts, spacing, responsive layout | `assets/css/site.css` |
| Menu, language/theme controls, archive display, contact submission | `assets/js/site.js` |
| Logos | `assets/brand/` |
| Decorative tape | `assets/decor/tape.svg` |
| Other decorative graphics | `assets/decor/` |
| Browser tab icon | `favicon.svg` |
| Redirects, public API proxy and cache rules | `vercel.json` |
| Search engine page list | `sitemap.xml` |
| Search engine crawling rules | `robots.txt` |

English and Portuguese pages are separate files: update both. Navigation and
footers are also repeated across pages, so update every copy when changing a
global link. Search the whole repository for the old text or URL.

## Easiest workflow: GitHub in the browser

1. Open the website repository above and select the file from the table.
2. Click the pencil icon to edit. Change the words between HTML tags; preserve
   IDs, classes and `data-*` attributes unless you are changing their behaviour.
3. When committing, choose a **new branch** such as `edit-homepage`, and create
   a pull request. Vercel will normally create a preview for the branch.
4. Open that preview from Vercel or the pull request checks. Review desktop and
   mobile layouts, both languages, menu, archive, Studio link and contact form.
5. Merge the pull request into `main` when satisfied. Vercel deploys it to the
   existing domain. Wait for **Ready**, then check the live site.

Committing directly to `main` also works, but immediately changes production.
Never upload `.env`, API keys, passwords, databases, backups or `node_modules`.

## Editing locally

Use a fresh clone in your normal projects folder (or GitHub Desktop). The
`.audit/` folders in the current download are deployment working copies, not a
good place for day-to-day editing.

```powershell
git clone https://github.com/Bossmendesjr/die2harddie2flywebsite.git
cd die2harddie2flywebsite
git switch -c edit-homepage
```

Open the folder in your editor. To preview basic static layout locally:

```powershell
py -m http.server 3000
```

Open http://localhost:3000. This simple server does **not** implement Vercel's
API proxy, clean URLs or project rewrites; use the Vercel preview for those checks.
Stop it with Ctrl+C. After editing:

```powershell
git diff
git add index.html pt/index.html
git commit -m "Update homepage introduction"
git push -u origin edit-homepage
```

Replace the `git add` filenames with the files you intentionally changed. Open
a pull request from that branch, verify its preview, then merge.

## Common edits

**Colours and fonts:** the top of `assets/css/site.css` contains `:root` colour
variables such as `--orange`, `--paper`, `--ink` and `--acid`, and font variables.
The stylesheet also contains day/night overrides and mobile media queries.
Check both themes after editing. Keep font licences when replacing font files.

**Tape and images:** replace the relevant file and keep its proportions. The
current tape is your supplied 780 × 270 SVG. Homepage placement and size are
controlled by `.sticker-tape` in the stylesheet. Update both homepage image URLs
when replacing it again: for example `tape.svg?v=2` becomes `tape.svg?v=3`.

**Caching:** Vercel caches `/assets/` for a week. After changing a CSS, JavaScript
or image file, increment its `?v=` value in every HTML reference or use a new
filename. Otherwise returning visitors may keep seeing the old asset. The
current script reference is `site.js?v=173`; it should be bumped on the next
script edit. A hard refresh helps your browser, but versioning fixes all visitors.

**Studio button:** update the links in all English/Portuguese pages **and**
`initStudioLinks()` in `assets/js/site.js`; that function overrides the HTML links.
The public `/studio` page describes the collective; it is not the private app.
Keep the working Render address until the branded domain resolves on your
connection. The API proxy in `vercel.json` can continue using the Render address
behind the scenes, regardless of the visible Studio button address.

**Contact form:** changing visible wording is an HTML edit. Changing submitted
fields requires matching changes in `site.js` and the Studio API schema in
`apps/studio/app/main.py`. Never put provider API keys in frontend JavaScript.

**SEO:** edit each page's `<title>` and description. Update `sitemap.xml` when
adding or removing public pages. Add redirects in `vercel.json` for old URLs
when renaming a page; test them on a Vercel preview.

## Publishing work without editing code

Create or edit a project in Studio, complete its public project information,
and publish it. The website reads the public projects API; draft/private data
stays private. Public responses can be cached briefly, so updates may not appear
immediately. An empty archive means no projects have been published.

Google Drive archive links store references to originals. Adding a Drive link
does not automatically publish it as a public portfolio image or make it public
in Google Drive. Check sharing permissions and choose appropriate public cover
and project media separately.

## Studio DNS and login troubleshooting

Namecheap → Domain List → Manage `die2harddie2fly.com` → Advanced DNS:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| CNAME | `studio` | `die2hard-studio.onrender.com` | Automatic |

This record has been saved. Render has verified it and issued the certificate.
Do not change the `@` or `www` records: those serve the Vercel website.

`ERR_NAME_NOT_RESOLVED` happens before the browser reaches Studio; it is not a
password error. Different networks can cache old DNS answers. Use the working
Render address while propagation finishes. You can test another network (for
example mobile data). On Windows, `ipconfig /flushdns` clears the computer's
cache, but cannot clear your ISP's cache. Do not disable your firewall or browser
certificate checks to fix a DNS error.

For first-owner registration, use the one-time owner setup code, your email and
a password **you choose**, at least 10 characters. There is no default password.
The code can be obtained privately from Render Shell with
`cat /data/setup-token.txt` while setup is still required. It is consumed after
registration. Afterwards, sign in with your chosen password. Signing in on the
Render address and custom domain uses separate browser cookies, but the same
account and database.

## Rollback and backend changes

If a website change breaks production, use Vercel's rollback to a known-good
deployment, then revert/fix the bad Git commit so the next deployment keeps the
fix. A website rollback does not restore the Studio database.

Backend edits belong in `die2hard-platform/apps/studio/`. Test them before a
manual Render deployment and take a consistent database backup before migrations.
Keep `/data` persistent; never delete the disk to redeploy. OpenAI keys belong in
Render Environment, and AI usage has separate billing.
