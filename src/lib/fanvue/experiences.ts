/**
 * Fan experience types.
 *
 * Hand-derived from the public docs for publishing experiences
 * (https://api.fanvue.com/docs/app-store/experiences/publish) and the fan
 * report reasons the platform accepts. An experience is one row per app,
 * creator and `externalExperienceId`; publishing the same id again updates
 * the row in place.
 *
 * Unlike a listing, an experience is live the moment the API accepts it. There
 * is no submit-for-review step. Everything the moderation tool sees here is
 * already on a creator's profile.
 */

export type ExperienceAccessMode = "FREE" | "SUBSCRIPTION" | "PAID" | "HIDDEN";

export type ExperienceDeliveryMode = "EMBEDDED" | "EXTERNAL";

export type ExperienceType =
  | "LIVE_STREAM"
  | "LIVE_AUDIO"
  | "VIDEO"
  | "AUDIO"
  | "GAME"
  | "CHALLENGE"
  | "QUIZ"
  | "EVENT"
  | "OTHER";

/** Something a fan buys inside the experience: a spin, a reveal, a critique. */
export type ExperienceAction = {
  externalActionId: string;
  /** Shown to the fan in the payment dialog. */
  title: string;
  description: string | null;
  /** USD cents, 300..50000. */
  priceCents: number;
  status: "active" | "withdrawn";
};

export type ExperienceReportReason = "ABUSE" | "HACKED" | "ILLEGAL" | "OFFENSIVE" | "SPAM" | "STOLEN";

/**
 * A fan's report against a published experience. One per reporter per
 * experience: the platform drops repeat reports from the same fan, so every
 * row here is a distinct person.
 */
export type ExperienceReport = {
  reporterUuid: string;
  reason: ExperienceReportReason;
  feedback: string | null;
  /** ISO 8601. */
  reportedAt: string;
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
  /** Cover image, re-hosted by Fanvue. Placeholder host in the fixtures. */
  imageUrl: string | null;
  experienceType: ExperienceType;
  accessMode: ExperienceAccessMode;
  deliveryMode: ExperienceDeliveryMode;
  /** Where an EXTERNAL experience opens. `null` for EMBEDDED. */
  externalUrl: string | null;
  /** Never listed on the profile; reachable by share link only. Always true for HIDDEN. */
  hidden: boolean;
  /** USD cents, 300..50000. `null` unless `accessMode` is PAID. */
  priceCents: number | null;
  /** With `priceCents`, bills the fan monthly instead of once. */
  priceRecurring: boolean;
  actions: ExperienceAction[];
  /** ISO 8601. */
  publishedAt: string;
  /** ISO 8601. Updates re-trigger review. */
  updatedAt: string;
  /** Fans with live recurring access. A takedown has to deal with them. */
  activeSubscribers: number;
  reports: ExperienceReport[];
};
