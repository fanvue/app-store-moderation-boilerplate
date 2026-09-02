# Fanvue product engineer session: App Store listing moderation

Thanks for making time. This is a one-hour pairing session, not an exam. You will share your screen and build a small tool with an AI coding assistant (whichever you normally use) while your interviewer watches, pairs a little, and asks questions along the way. We care about how you think, how you verify what the AI gives you, and how you make product decisions. A finished product is not expected. An honest "here is what works, here is what does not" at the end is worth more than polish.

## Before the call (about 20 minutes)

Setup (about 10 minutes):

- [ ] Node 24 (any 24.x): `nvm install 24` or `fnm install 24`. Node 22 prints an engine warning but still works
- [ ] `corepack enable` (gives you pnpm). If `corepack` is not found or `corepack enable` errors, run `npm i -g pnpm@10` instead
- [ ] The first `pnpm` command may ask once `Corepack is about to download pnpm ... continue?`. Answer `y`
- [ ] Windows works natively. WSL is optional; if you use it, clone inside `~/`, not `/mnt/c`
- [ ] git, and a GitHub account you can push to (or plan to share a zip instead, see Deliverable)
- [ ] Your AI coding tool installed and signed in (Codex, Claude Code, Cursor, Copilot, any is fine)
- [ ] Clone the repo: `git clone https://github.com/fanvue/app-store-moderation-boilerplate`
- [ ] `pnpm install`
- [ ] `pnpm dev`, then open http://localhost:3000 and check you see 15 listings. The first page load in dev takes 10 to 20 seconds. Images are external placeholders, so they show as broken when you are offline; that is expected

Reading (about 10 minutes):

- [ ] Skim `docs/listing-requirements.md` in the repo, starting with the "Common rejection reasons" table. The hour is short, so we will not spend it reading: at the start of the call you will be asked which rules a machine could check and which need a person

You do not need a Fanvue account or any API credentials. Everything runs locally from fixture data.

If something fails to install, do not lose time on it. Reply to the email you received and we will sort it at the start of the call.

## Context

Fanvue is a platform where creators publish content and earn from subscribers. The Fanvue App Store lets third-party developers build apps for those creators and list them for discovery. Every listing has to meet a public set of Listing Requirements before it goes live, covering things like screenshots, naming, pricing, links, and not promoting other platforms. Today a human reads each listing against those rules. Some of the rules need a human; several can be checked automatically and would save the reviewer time. You are going to build that automatic part.

## The task

Implement `validateListing(listing)` in `src/lib/moderation/rules.ts` so it returns a list of findings for the deterministic rules in the requirements doc, with tests in `src/lib/moderation/rules.test.ts`.

Each finding should cite the rule number from the doc (for example `2.3`) and carry a severity. The types are already in the stub: `Issue = { code, rule, severity: "reject" | "fix" | "warn", message, field? }`. You decide what each severity means and which rules get which. Be ready to explain your reasoning.

**Two rules with red-then-green tests wired into the queue is a complete result.** More is welcome, but depth beats breadth. "Wired into the queue" needs no UI work from you: the review queue (`app/page.tsx`) already shows a Findings column and the detail page (`app/listings/[uuid]/page.tsx`) already lists findings.

If you have time after the rules, improve the UI, in this order:

- Sort the queue so listings that need rejecting come first.
- Make "no findings" distinct from "not checked".
- Link each finding to its rule in the doc.

**Record your assumptions.** The requirements doc contains very few numbers. The price range for paid plans ($3.99 to $500) is public and you may use it (link below). Anything else you add, such as a list of placeholder words, a length limit, or an interpretation of an ambiguous rule, is an assumption: write it down in `ASSUMPTIONS.md` and emit it as `warn` unless the doc is explicit.

Out of scope, do not attempt:

- Anything that needs a human eye: image quality, originality, NSFW imagery, interface quality, whether a description is "clear"
- Typo or grammar detection
- Fetching URLs to see if they respond

If you are unsure whether a rule is automatable, say so and move on. That is the right call.

## Inputs

| What                                       | Where                                                                                                                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Listing Requirements (the spec)            | `docs/listing-requirements.md` in the repo (snapshot dated 2026-09-02); live copy at https://api.fanvue.com/docs/app-store/listing-requirements                       |
| Pricing plans (source for the price range) | `docs/pricing-plans.md` in the repo (snapshot dated 2026-09-02); live copy at https://api.fanvue.com/docs/app-store/payments/pricing-plans                            |
| Boilerplate repo                           | https://github.com/fanvue/app-store-moderation-boilerplate                                                                                                            |
| Sample listings (15, typed)                | `fixtures/listings.ts` in the repo                                                                                                                                    |
| Listing type                               | `src/lib/fanvue/types.ts` in the repo                                                                                                                                 |
| Public API spec excerpt                    | `docs/openapi.apps.json` in the repo                                                                                                                                  |
| Mock API (list)                            | `GET http://localhost:3000/api/v0/apps`, params `page`, `size`, `search`, returns `{ data, pagination }`                                                              |
| Mock API (detail)                          | `GET http://localhost:3000/api/v0/apps/{uuid}`, returns one listing                                                                                                   |
| Typed API client the UI already uses       | `src/lib/fanvue/api.ts` in the repo                                                                                                                                   |
| `@fanvue/ui` component library             | Source https://github.com/fanvue/fanv-ui, Storybook https://main--697a1b6dd4dad73ee9c0e5f5.chromatic.com/, offline types in `node_modules/@fanvue/ui/dist/index.d.ts` |

Start with the vendored docs in the repo: your AI tool's sandbox may be offline, and the files are the same content as the public pages.

The mock API mirrors the live endpoints documented at https://api.fanvue.com/docs: same paths, same params, same response envelope and listing shape. Auth and version headers are ignored locally.

Useful scripts: `pnpm dev`, `pnpm test`, `pnpm test:watch`, `pnpm typecheck`, `pnpm lint`, `pnpm build`.

## How we will run it

| Time      | What happens                                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0-5 min   | Hello, confirm the app runs on your machine                                                                                                                   |
| 5-15 min  | You tell your interviewer which rules you can automate and what severity each should get. They will ask you to justify a couple                               |
| 15-45 min | You build: rules and tests first, then the UI if time remains. Use your AI tool as much as you like. Your interviewer will ask questions as you go            |
| 45-55 min | You walk your interviewer through your diff as if it were a PR, then demo to them as if they were a Fanvue app reviewer: what fired, where, what happens next |
| 55-60 min | Share your work                                                                                                                                               |

Your interviewer will interrupt with questions. That is the format, not a sign something is wrong.

## What we are looking for

- You read the requirements and can say which rules a machine can check and which need a person
- You read what the AI generates before accepting it, and check its claims about the rules against the actual doc
- You write tests and you see them fail before they pass
- Your types match reality (some fields are nullable, prices are in minor units)
- Your severities and queue order make sense for the person who has to act on them
- You write down assumptions instead of presenting them as rules
- You explain your thinking as you go and ask when something is unclear
- You are honest about what is unfinished

## Deliverable

At the end, share your work in one of two ways:

- Create your own **private** repository from this template (the green "Use this template" button on GitHub, choose Private), push your work there and invite your interviewer as a collaborator.
- Or share a zip of the folder.

Please do not fork the repo or open a pull request against it: the repo is public and your work would be too.

Include a few lines (in a `NOTES.md` or your README, or in the chat) covering:

- What is done
- What is not done
- What you would do next

And make sure `ASSUMPTIONS.md` is in there.

## Stretch (only if time)

- Show the developer a plain-English explanation of each finding and how to fix it, with a link to the rule
- Give each listing a risk score so the queue orders by overall risk, not just the worst finding
- `descriptionBody` may contain markdown: make sure formatting does not cause false positives in your text checks

## Ground rules

- Use any AI tool you like. If yours is having a bad day, switch to another
- Ask questions at any time
- No need to memorise anything. "I'd look that up" is a fine answer, and then look it up
- Plain HTML is fine if the component library is slowing you down. UI polish is not what we are assessing
- There is no scheduled break in the hour. Say so if you need one
- Your work stays yours. We will not reuse it, and you can delete it after the process
