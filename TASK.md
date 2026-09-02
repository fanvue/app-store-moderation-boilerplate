# Fanvue product engineer session: App Store listing moderation

Thanks for making time. This is a one-hour pairing session, not an exam. You will share your screen and build a small tool with an AI coding assistant (whichever you normally use) while Simon (your interviewer) watches, pairs a little, and asks questions. We care about how you think, how you check what the AI gives you, and how you make product decisions. A finished product is not expected. An honest "here is what works, here is what does not" beats polish.

## The task

Fanvue is a platform where creators publish content and earn from subscribers. The Fanvue App Store lets third-party developers list apps for those creators. Every listing must meet the public Listing Requirements before it goes live: screenshots, naming, pricing, links, not promoting other platforms. Today a human checks each listing against those rules. Several of the rules can be checked automatically. You build that part.

Implement `validateListing(listing)` in `src/lib/moderation/rules.ts` so it returns findings for the deterministic rules in the requirements doc (rules a program can decide from the listing data alone), with tests in `src/lib/moderation/rules.test.ts`.

**Two rules with red-then-green tests wired into the queue is a complete result.** Red-then-green means you saw the test fail before the rule existed. Wiring needs no UI work: the review queue and the detail page already render whatever `validateListing` returns. More rules are welcome, but depth beats breadth.

Each finding cites the rule number from the doc (for example `2.3`) and carries a severity. The types are in the stub: `Issue = { code, rule, severity: "reject" | "fix" | "warn", message, field? }`. You decide what each severity means and which rules get which. Be ready to explain why.

**Record your assumptions.** The doc contains very few numbers. The price range for paid plans, $3.99 to $500, is public and you may use it. Anything else you add (a placeholder word list, a length limit, a reading of an ambiguous rule) is an assumption. Write it in `ASSUMPTIONS.md` and emit it as `warn` unless the doc is explicit.

Out of scope: anything that needs a human eye (image quality, originality, NSFW imagery, interface quality, whether a description is "clear"), typo or grammar detection, and fetching URLs to see if they respond. If you are unsure whether a rule is automatable, say so and move on. That is the right call.

If time remains after the rules, in this order: sort the queue so listings that need rejecting come first; make "no findings" look different from "not checked"; link each finding to its rule in the doc. UI polish is not assessed. Plain HTML is fine; if you want `@fanvue/ui`, its props are in `node_modules/@fanvue/ui/dist/index.d.ts`.

## Inputs

| What                                      | Where                                                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Listing Requirements (the spec)           | `docs/listing-requirements.md`. Start with the "Common rejection reasons" table at the bottom                          |
| Pricing plans (source of the price range) | `docs/pricing-plans.md`                                                                                                |
| 15 sample listings                        | `fixtures/listings.ts`                                                                                                 |
| Listing type                              | `src/lib/fanvue/types.ts`. The field comments say which array holds the screenshots and that prices are in minor units |

Use the copies in `docs/`: they match the live pages at https://api.fanvue.com/docs/app-store, and your AI tool's sandbox may be offline.

## Setup (first 10 minutes of the call, together)

No preparation is needed before the call. In the first minutes we get the repo running on your machine, following the Quick start in the README: Node 24 (Node 22 works with a warning), `pnpm install`, `pnpm dev`, then check http://localhost:3000 shows 15 listings. Have your AI coding tool signed in (Codex, Claude Code, Cursor, Copilot, any is fine) and git plus a GitHub account you can push to (or plan to share a zip, see Deliverable).

You do not need a Fanvue account or API credentials. Everything runs locally from fixture data. If something fails to install, say so and we move to Simon's machine; that does not count against you.

## The hour

| Time      | What happens                                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0-10 min  | Hello, get the repo running, quick tour of the files                                                                                                 |
| 10-20 min | You read the "Common rejection reasons" table, then say which rules you can automate and what severity each gets. Simon asks you to justify a couple |
| 20-45 min | You build: rules and tests first, UI if time remains. Use your AI tool as much as you like                                                           |
| 45-55 min | You walk through your diff as if it were a PR, then demo as if Simon were a Fanvue app reviewer: what fired, where, what happens next                |
| 55-60 min | Share your work                                                                                                                                      |

Simon will interrupt with questions. That is the format, not a sign something is wrong. Ask anything at any time; "I'd look that up" is a fine answer, then look it up. There is no scheduled break; say so if you need one.

## Deliverable

Share your work in one of two ways:

- Create your own **private** repository from this template (the green "Use this template" button on GitHub, choose Private), push, and invite Simon (GitHub: `simonstaton`) as a collaborator.
- Or share a zip of the folder.

Do not fork the repo or open a pull request against it: the repo is public and your work would be too. Your work stays yours; we will not reuse it, and you can delete it after the process.

Include a few lines (in `NOTES.md`, your README, or the chat) on what is done, what is not, and what you would do next. Make sure `ASSUMPTIONS.md` is in there.

## What we are looking for

- You can say which rules a machine can check and which need a person, and you check the AI's claims about the rules against the actual doc
- You write tests and see them fail before they pass
- Your types match reality (some fields are nullable, prices are in minor units)
- Your severities and queue order make sense for the person who has to act on them
- You write down assumptions instead of presenting them as rules
- You explain your thinking as you go, ask when something is unclear, and are honest about what is unfinished
