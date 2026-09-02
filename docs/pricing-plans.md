<!-- Snapshot taken 2026-09-02 of https://api.fanvue.com/docs/app-store/payments/pricing-plans (canonical URL).
     Vendored so the task works offline. If this file and the live page differ, the live page wins. -->

# Pricing Plans

> Set up monthly subscription pricing for your app: plan fields and limits, statuses, plan IDs, and the events each subscription emits.

Pricing plans are the monthly subscriptions creators buy to access your app. Configure them in the Builder; Fanvue runs checkout and renewals and emits [`app.*` webhooks](/docs/app-store/webhooks) for every charge.

## Create a plan

In the Builder (Developer area), open your app and go to **Store Listing → Pricing**, then **Add Plan**.

| Field          | Constraints                                         |
| -------------- | --------------------------------------------------- |
| Plan name      | Up to 20 characters (e.g. "Pro Monthly")            |
| Tagline        | Up to 40 characters, shown on the plan's card       |
| Highlights     | Up to 5 feature bullets shown on the plan's card    |
| Access         | **Free** or **Paid**                                |
| Price          | Between **\$3.99** and **\$500.00** (paid plans)    |
| Billing period | **Monthly**. Currently the only interval available. |

**Fanvue takes 20% of each sale; you keep 80%.**

<Warning>
  ##### Plan edits feed your listing submission

  Plan details appear on your public listing, so saving changes here **starts or updates a listing submission** and goes through review. Batch pricing changes with your other listing edits. See [Publishing Your App](/docs/app-store/publishing-your-app).
</Warning>

## Plan lifecycle

| Status            | Meaning                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **Pending setup** | The plan is configured but not yet live. It activates automatically when your app is approved.     |
| **Active**        | Live on your listing and purchasable. Only active plans can be [deeplinked](/docs/app-store/deeplinks). |
| **Withdrawn**     | Taken down; not purchasable.                                                                       |

Read the same lifecycle over the API with [`GET /apps/{appUuid}/subscription-status`](/docs/app-store/app-subscriptions): each plan's `status` plus an app-level `overallStatus`.

## Plan IDs

Every plan has a UUID, shown in the **Plan ID** column of the pricing table; click it to copy the full value. You will use it in three places:

* **Deeplinks**: `?plan=<planUuid>` preselects the plan on your listing; add `&action=checkout` to skip the picker. See [Deeplinks](/docs/app-store/deeplinks).
* **Webhooks**: the plan comes back as `item.uuid` on [`app.payment.*`](/docs/app-store/webhooks/payments) and as `plan.uuid` on [`app.subscription.*`](/docs/app-store/webhooks/subscriptions) events.
* **Entitlement**: [`GET /apps/{appUuid}/subscription/me`](/docs/app-store/app-subscriptions) returns the buyer's matched `planUuid`, which you compare against your feature tiers.

## How buyers subscribe

A creator can reach checkout for a plan three ways:

1. **Your listing's plan picker.**
2. **A [deeplink](/docs/app-store/deeplinks#behaviour-by-viewer-state)** with the plan preselected, or straight into checkout. Safe to send to broad audiences.
3. **A checkout link** (`https://www.fanvue.com/checkout/app_...`); buyers must be signed in.

## What fires when someone subscribes

The money and the access state arrive as separate events:

| Moment                     | Events                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Initial purchase           | `app.payment.succeeded` (`billing_reason: subscription_initial`) **and** `app.subscription.activated` |
| Monthly renewal            | `app.payment.succeeded` (`billing_reason: subscription_renewal`)                                      |
| Failed renewal charge      | `app.payment.failed` with a decline `reason`                                                          |
| Buyer turns off auto-renew | `app.subscription.cancel_at_period_end_changed`; the buyer keeps access until the period ends         |

The subscription payload does not tell you when access ends: `status` stays `active` (including after a cancellation) and `expires_at` is always `null`, so branch on `cancel_at_period_end`, and read live state from [`GET /apps/{appUuid}/subscription/me`](/docs/app-store/app-subscriptions) (`hasActiveSubscription`, `currentPeriodEnd`, `cancelAtPeriodEnd`). `app.subscription.deactivated` is a reserved name that is not emitted.

## Tracking revenue

Subscriber counts are in the pricing table, earnings in your app's **Revenue** tab. For programmatic reconciliation, see [Reconciliation](/docs/app-store/webhooks#reconciliation).
