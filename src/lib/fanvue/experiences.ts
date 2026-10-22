/**
 * Fan experience types. There is one experience per creator and
 * `externalExperienceId`. Publishing the same id again updates it in place.
 * Each experience also has its own `uuid`.
 */

export type ExperienceAccessMode = "FREE" | "SUBSCRIPTION" | "PAID" | "HIDDEN";

export type ExperienceDeliveryMode = "EMBEDDED" | "EXTERNAL";

export type ExperienceType =
  "LIVE_STREAM" | "LIVE_AUDIO" | "VIDEO" | "AUDIO" | "GAME" | "CHALLENGE" | "QUIZ" | "EVENT" | "OTHER";

/** Fans only see an `approved` experience. */
export type ExperienceReviewStatus = "pending_review" | "approved" | "rejected";

/** Fields whose edits go back to review. Fans keep seeing the approved version meanwhile. */
export type ReviewedField = "title" | "description" | "imageUrl" | "deliveryMode" | "externalUrl";

/** Something a fan buys inside the experience: a spin, a reveal, a critique. */
export type ExperienceAction = {
  externalActionId: string;
  /** Shown to the fan in the payment dialog. */
  title: string;
  description: string | null;
  /** USD cents. */
  priceCents: number;
};

export type ExperienceReportReason = "ABUSE" | "HACKED" | "ILLEGAL" | "OFFENSIVE" | "SPAM" | "STOLEN";

/** A fan's report against an experience. The same fan can report more than once. */
export type ExperienceReport = {
  reporterUuid: string;
  reason: ExperienceReportReason;
  feedback: string | null;
  /** ISO 8601. */
  reportedAt: string;
  status: "OPEN" | "REVIEWED";
};

export type FanExperience = {
  uuid: string;
  /** The app's own stable id for this experience. */
  externalExperienceId: string;
  app: {
    uuid: string;
    name: string;
  };
  creator: {
    handle: string;
  };
  /** Up to 100 characters. */
  title: string;
  /** Up to 500 characters. Shown on the detail page. */
  description: string;
  /** Cover image. Fanvue stores its own copy, so a new cover means a new URL. */
  imageUrl: string | null;
  /** A label on the chat card. `LIVE_STREAM` does not change how the experience is delivered. */
  experienceType: ExperienceType;
  accessMode: ExperienceAccessMode;
  /** EMBEDDED runs in a frame on Fanvue. EXTERNAL opens `externalUrl` in a new tab. */
  deliveryMode: ExperienceDeliveryMode;
  externalUrl: string | null;
  /** Not listed on the profile. Fans reach it by share link only. Always true for HIDDEN. */
  hidden: boolean;
  /** USD cents. `null` unless `accessMode` is PAID. */
  priceCents: number | null;
  /** When true, `priceCents` is billed monthly instead of once. */
  priceRecurring: boolean;
  actions: ExperienceAction[];
  reviewStatus: ExperienceReviewStatus;
  /** Edited fields waiting for review. The values above are the edited ones. */
  pendingReviewFields: ReviewedField[];
  /** ISO 8601, or `null`. Set when Fanvue suspends the experience. */
  suspendedAt: string | null;
  /** ISO 8601. */
  publishedAt: string;
  /** ISO 8601. */
  updatedAt: string;
  /** Fans who have paid for access. */
  paidImpact: {
    /** Fans with live monthly access. */
    activeSubscriptionCount: number;
    /** Fans who paid once. */
    oneTimePurchaseCount: number;
  };
  reports: ExperienceReport[];
};

/**
 * Sent when an experience is published, changes, or is reported. Every event
 * carries the whole experience at that moment, reports included. Delivery is
 * at least once, so the same `id` can arrive more than once.
 *
 * The exercise assumes Fanvue sends these events.
 */
export type ExperienceEvent = {
  /** Unique per event, and the same on every delivery. */
  id: string;
  type: "experience.published" | "experience.updated" | "experience.reported";
  /** ISO 8601. */
  occurredAt: string;
  experience: FanExperience;
};
