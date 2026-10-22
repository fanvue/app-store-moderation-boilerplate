/**
 * Fan experience types. There is one experience per app, creator and
 * `externalExperienceId`. Publishing the same id again updates it in place.
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
  /** USD cents. */
  priceCents: number;
  status: "active" | "withdrawn";
};

export type ExperienceReportReason = "ABUSE" | "HACKED" | "ILLEGAL" | "OFFENSIVE" | "SPAM" | "STOLEN";

/** A fan's report against an experience. Each report is from a different fan. */
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
  /** USD cents. `null` unless `accessMode` is PAID. */
  priceCents: number | null;
  /** When true, `priceCents` is billed monthly instead of once. */
  priceRecurring: boolean;
  actions: ExperienceAction[];
  /** ISO 8601. */
  publishedAt: string;
  /** ISO 8601. */
  updatedAt: string;
  /** Fans with live recurring access. */
  activeSubscribers: number;
  reports: ExperienceReport[];
};

/**
 * Sent when an experience is published, updated or reported. Every event
 * carries the whole experience at that moment, reports included. Delivery is
 * at least once, so the same `id` can arrive more than once.
 */
export type ExperienceEvent = {
  /** Unique per event, stable across redeliveries. */
  id: string;
  type: "experience.published" | "experience.updated" | "experience.reported";
  /** ISO 8601. */
  occurredAt: string;
  experience: FanExperience;
};
