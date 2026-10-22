<!-- Trimmed snapshot, taken 2026-09-02, of https://api.fanvue.com/docs/app-store/payments/pricing-plans.
     Vendored so the task works offline. Only the parts listing review uses are kept. -->

# Pricing Plans

Pricing plans are the monthly subscriptions creators buy to access an app. Developers configure them in the Builder, and plan details appear on the public listing, so editing a plan starts a new listing submission.

For [3.3 Pricing accuracy](listing-requirements.md#33-pricing-accuracy) you need the **Price** row and the [plan lifecycle](#plan-lifecycle).

## Plan fields

| Field          | Constraints                                         |
| -------------- | --------------------------------------------------- |
| Plan name      | Up to 20 characters (e.g. "Pro Monthly")            |
| Tagline        | Up to 40 characters, shown on the plan's card       |
| Highlights     | Up to 5 feature bullets shown on the plan's card    |
| Access         | **Free** or **Paid**                                |
| Price          | Between **\$3.99** and **\$500.00** (paid plans)    |
| Billing period | **Monthly**. Currently the only interval available. |

## Plan lifecycle

| Status            | Meaning                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| **Pending setup** | The plan is configured but not yet live. It activates automatically when the app is approved. |
| **Active**        | Live on the listing and purchasable.                                                           |
| **Withdrawn**     | Taken down; not purchasable.                                                                   |
