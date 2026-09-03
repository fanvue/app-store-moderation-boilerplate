# Assumptions

One bullet for every check that the docs do not state in so many words (a number, a word list, a URL pattern): the rule it supports, what you assumed, and why. Replace the example below.

- **Rule 3.3** paid-plan price range: apply the documented $3.99–$500.00 range only to plans with `currencyCode: "USD"`. The listing type permits other currencies, but the pricing document gives no equivalent ranges or conversion method.

- **Rule 1.6** competitor promotion: warn when normalized listing copy contains `onlyfans` or `fansly`; normalize `0` to `o` and `1` to `l` to catch common obfuscation. The requirement does not provide a canonical competitor list.

- **Rules 3.1–3.2** external payments: warn when listing copy mentions `stripe`, `paypal`, `payment link`, or `external checkout`. The requirement prohibits external payment flows but does not enumerate providers or phrases.

- **Rule 2.3** pricing consistency: warn when `pricingType: "free"` has a non-free plan or `pricingType: "monthly"` has no non-free plans. The API exposes both fields but does not explicitly document their relationship.

- **Rule 2.1** placeholder copy: warn for `lorem ipsum` and `TODO`. The requirement says to remove placeholders but does not define a vocabulary.

- **Rule 2.3** English language: warn when listing copy contains at least three configured Spanish-language signature words. This is a narrow, deliberately cautious heuristic rather than full language detection.
