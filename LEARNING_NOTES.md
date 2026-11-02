# Learning Notes

Running summary of new concepts covered each session. Newest session at the bottom.

---

## Session 1 — 2026-11-01 — Build step 1: scaffold the Next.js portfolio

### What we did
- Scaffolded a Next.js 16 app into `web/` with `create-next-app`, using TypeScript, Tailwind CSS v4, ESLint, the App Router, and a `src/` directory.
- Moved the git repository to the top-level `portfolio+levart/` folder so `web/` can later sit beside `backend/` (Java), `scripts/` (Python), and `wasm/` (C).
- Ran the dev server (`npm run dev` inside `web/`) and confirmed the default page renders at http://localhost:3000.

### Concepts

**Scaffolding tool.** `create-next-app` is to Next.js what Spring Initializr is to Spring Boot: it generates the boilerplate so you start from a working app.

**package.json = pom.xml / requirements.txt.** It lists dependencies (what the app needs to run) and devDependencies (what you need only while developing, like TypeScript and ESLint). The `scripts` section defines named commands: `npm run dev`, `npm run build`, `npm run lint`.

**node_modules/ is the installed library folder.** Like a Python venv's `site-packages` or Maven's `.m2`. It is huge and is regenerated from `package-lock.json` with `npm install`, so it is git-ignored.

**TypeScript.** JavaScript plus static types. `function f(x: number): string` reads like Java. Unlike Java, TypeScript types are erased at build time; they exist only to catch mistakes before the code runs. `tsconfig.json` is the compiler config, with `"strict": true` turning on the strongest checks.

**The App Router: folders are routes.** Under `src/app/`, every folder with a `page.tsx` becomes a URL. `src/app/page.tsx` is `/`, and later `src/app/projects/page.tsx` will be `/projects`. This is file-based routing; there is no routing table to maintain.

**layout.tsx vs page.tsx.** `layout.tsx` is the shared wrapper (the `<html>` and `<body>`, fonts, and later the nav bar and footer). `page.tsx` is the content for one URL. The page is passed into the layout as `children`, the same way a Jinja base template wraps a child template in Python.

**Components are functions returning JSX.** `export default function Home() { return <div>...</div> }`. JSX looks like HTML inside JavaScript. The browser never sees JSX; the build step compiles it to ordinary function calls.

**Tailwind CSS.** Instead of writing CSS rules in a separate file, you add utility classes directly on elements: `className="flex items-center text-lg"`. In React, the attribute is `className`, not `class`, because `class` is a reserved word in JavaScript.

**globals.css with Tailwind v4.** A single `@import "tailwindcss";` line pulls in the framework. `@theme` declares design tokens (colors, fonts) as CSS variables, so `bg-background` becomes a usable class.

**Import alias `@/`.** `@/components/Nav` maps to `src/components/Nav`. Configured under `paths` in `tsconfig.json`. Avoids long `../../../` chains.

**ESLint.** A linter like Checkstyle (Java) or Pylint (Python). Catches likely bugs and style problems. Config lives in `eslint.config.mjs`.

**.gitignore.** Lists what git should never track: `node_modules/`, build output in `.next/`, and `.env*` secret files.

### Added later in session 1: git remotes, SSH keys, and deploying

**Local vs remote repo.** `git init` made a local repo on your Mac (history in `.git/`). GitHub holds a remote copy. `git remote add origin <url>` names the remote; `git push -u origin main` uploads the `main` branch and remembers the pairing so later pushes are just `git push`.

**Why the empty GitHub repo.** If GitHub had added a README, it would have made its own first commit, and the two histories would conflict with the commit already on your Mac.

**SSH keys.** A key pair: private key stays on the Mac (`~/.ssh/id_ed25519`), public key (`.pub`) gets pasted into GitHub. Git proves who you are by signing a challenge with the private key; GitHub checks the signature with the public key. No password or token needed. The private key can itself be locked with a passphrase; `ssh-add --apple-use-keychain` unlocks it once and stores the passphrase in macOS Keychain.

**Two GitHub accounts, one Mac.** Git's HTTPS credentials in the keychain belonged to one account, while the repo was under another. SSH sidestepped that: the remote URL `git@github.com:...` uses the key, while `https://github.com/...` uses the keychain password/token.

**Vercel deploy pipeline.** Vercel is linked to the GitHub repo with Root Directory set to `web`. Every push to `main` triggers `npm install`, `npm run build`, and a new production deploy. No manual upload needed. Site: https://bumkyu.vercel.app (Vercel project `bumkyu`), custom domain bumkyu.com pending purchase.

**Three separate authorizations Vercel needed.** (1) CLI login, (2) a "login connection" tying the Vercel account to a GitHub account, (3) installing Vercel's GitHub app on that account so it can read the repo and receive push notifications.

**Vercel framework preset.** When a Vercel project is created by hand (not by `vercel deploy`), it has no framework preset, so Vercel builds the app but doesn't know how to serve a Next.js output and every URL returns NOT_FOUND. Fix: set the preset to Next.js (`vercel project update <name> --framework nextjs`) and redeploy. Lesson: a green "Ready" build does not mean the site works; always open the URL.

### Common mistakes to watch for
- Writing `class=` instead of `className=` in JSX.
- Forgetting that `page.tsx` must have a `default` export, or Next.js won't recognize it as a route.
- Running `npm run dev` from the wrong folder. It must be run inside `web/`.
- Editing `node_modules/` directly. Changes there vanish on the next install.

### Check-in questions
1. If you create `src/app/levart/page.tsx`, what URL does it serve?
2. What is the difference between `layout.tsx` and `page.tsx`?
3. Why is `node_modules/` git-ignored but `package-lock.json` is committed?
