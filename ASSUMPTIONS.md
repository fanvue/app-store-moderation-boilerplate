# Assumptions

The [rules doc](docs/listing-requirements.md) leaves things open on purpose: how close two descriptions have to be before they are the same listing, how to tell `Only Fans` the name from `only fans` the phrase, whether a withdrawn plan can hold up an approval, what a plan in another currency deserves.

Two sections. Fill the first before you write a second rule; add to the second as you go.

## Severities

One line per rule: the severity you chose and why, citing [4.5](docs/listing-requirements.md#45-how-we-apply-this-bar) where it applies.

- **[1.6](docs/listing-requirements.md#16-no-promotion-of-other-platforms)** ...
- **[2.1](docs/listing-requirements.md#21-production-ready)** ...
- **[2.3](docs/listing-requirements.md#23-listing-quality)** `fix`, as the [worked example](src/lib/moderation/rules.ts) says. Change it if you disagree.
- **[3.3](docs/listing-requirements.md#33-pricing-accuracy)** ...
- **[4.2](docs/listing-requirements.md#42-originality)** ...
- **[6.2](docs/listing-requirements.md#62-valid-owned-url)** ...

## Everything else

One bullet each for the things you decided: the rule it belongs to, what you chose, and why. Include what triggers the review job, your schema and why, and what the job re-reviews when one listing changes.

- **Rule [4.2](docs/listing-requirements.md#42-originality)** two descriptions count as the same listing above N% overlap of three-word runs, because ... (example, replace with your own)
