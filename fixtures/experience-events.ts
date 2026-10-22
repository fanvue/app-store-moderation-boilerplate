import type { ExperienceEvent, ExperienceReport, FanExperience } from "@/lib/fanvue/experiences";

/**
 * The event history `npm run replay-events` posts to `app/api/moderation/events`,
 * and that `src/lib/moderation/experiences/spec.test.ts` replays. Each
 * experience is published. Most are then approved by a reviewer and changed
 * or reported. The cases are listed in `docs/production.md`.
 */

type Step = {
  at: string;
  /** Fields that change in this event. */
  change?: Partial<FanExperience>;
  /** A fan report. The event is then `experience.reported`. */
  report?: Omit<ExperienceReport, "status">;
  /** Deliver this event twice in a row, as at-least-once delivery can. */
  deliverTwice?: boolean;
};

type Draft = Omit<ExperienceEvent, "id"> & { deliverTwice: boolean };

const experience = (
  fields: Partial<FanExperience> &
    Pick<FanExperience, "uuid" | "externalExperienceId" | "app" | "creator" | "title" | "description" | "publishedAt">,
): FanExperience => ({
  imageUrl: `https://placehold.co/1200x630/png?text=${encodeURIComponent(fields.title)}`,
  experienceType: "OTHER",
  accessMode: "FREE",
  deliveryMode: "EMBEDDED",
  externalUrl: null,
  hidden: false,
  priceCents: null,
  priceRecurring: false,
  actions: [],
  reviewStatus: "pending_review",
  pendingReviewFields: [],
  suspendedAt: null,
  updatedAt: fields.publishedAt,
  paidImpact: { activeSubscriptionCount: 0, oneTimePurchaseCount: 0 },
  reports: [],
  ...fields,
});

/** Publish an experience, then apply each step as its own event. */
const history = (published: FanExperience, steps: Step[]): Draft[] => {
  let current = published;
  const drafts: Draft[] = [
    { type: "experience.published", occurredAt: published.publishedAt, experience: current, deliverTwice: false },
  ];
  for (const step of steps) {
    if (step.report) {
      current = { ...current, ...step.change, reports: [...current.reports, { ...step.report, status: "OPEN" }] };
      drafts.push({
        type: "experience.reported",
        occurredAt: step.at,
        experience: current,
        deliverTwice: !!step.deliverTwice,
      });
    } else {
      current = { ...current, ...step.change, updatedAt: step.at };
      drafts.push({
        type: "experience.updated",
        occurredAt: step.at,
        experience: current,
        deliverTwice: !!step.deliverTwice,
      });
    }
  }
  return drafts;
};

/**
 * A reviewer approves the experience. Fans can only pay once it is approved, so
 * a published experience has no paying fans and `paidImpact` arrives here.
 */
const approve = (at: string, paidImpact?: FanExperience["paidImpact"]): Step => ({
  at,
  change: { reviewStatus: "approved", ...(paidImpact && { paidImpact }) },
});

const lenswork = { uuid: "7c1e4b2a-0d3f-4e8b-9a6c-2f5d8e1b3c47", name: "Lenswork" };

const drafts: Draft[] = [
  // Price lowered for paying fans: fine.
  ...history(
    experience({
      uuid: "e1a2b3c4-d5e6-4f70-8192-a3b4c5d6e7f8",
      externalExperienceId: "course-photography-101",
      app: lenswork,
      creator: { handle: "mira" },
      title: "Photography 101",
      description: "Six lessons, shot on film. Cancel whenever you like.",
      experienceType: "VIDEO",
      accessMode: "PAID",
      priceCents: 700,
      priceRecurring: true,
      publishedAt: "2026-09-14T10:02:00Z",
    }),
    [
      approve("2026-09-14T15:30:00Z", { activeSubscriptionCount: 38, oneTimePurchaseCount: 0 }),
      { at: "2026-10-02T09:00:00Z", change: { priceCents: 600 } },
    ],
  ),

  // Monthly price raised while fans are subscribed: E5.
  ...history(
    experience({
      uuid: "e7b8c9d0-e1f2-4384-95a6-b7c8d9e0f1a2",
      externalExperienceId: "film-club",
      app: { uuid: "c16d9a7f-5c8e-4d3a-8f1b-7e0c3d6a8192", name: "Reelhouse" },
      creator: { handle: "sam" },
      title: "Film Club",
      description: "One film a week, watched together with live chat.",
      experienceType: "EVENT",
      accessMode: "PAID",
      priceCents: 500,
      priceRecurring: true,
      publishedAt: "2026-09-03T18:00:00Z",
    }),
    [
      approve("2026-09-04T09:10:00Z", { activeSubscriptionCount: 14, oneTimePurchaseCount: 0 }),
      { at: "2026-10-05T20:15:00Z", change: { priceCents: 1200 } },
    ],
  ),

  // Monthly price raised with no subscribers yet: fine.
  ...history(
    experience({
      uuid: "f1a2b3c4-d5e6-4f70-8192-a3b4c5d6e701",
      externalExperienceId: "zine-club",
      app: { uuid: "f49a2d0c-8f1b-4a6d-9c4e-0b3f6a9d1425", name: "Inkwell" },
      creator: { handle: "kit" },
      title: "Zine Club",
      description: "A new hand-drawn zine every month.",
      accessMode: "PAID",
      priceCents: 800,
      priceRecurring: true,
      publishedAt: "2026-09-20T12:00:00Z",
    }),
    [approve("2026-09-21T10:00:00Z"), { at: "2026-10-08T08:30:00Z", change: { priceCents: 1000 } }],
  ),

  // New paid action added after approval: E1. The update is delivered twice.
  ...history(
    experience({
      uuid: "e6a7b8c9-d0e1-4273-84a5-b6c7d8e9f0a1",
      externalExperienceId: "private-qa",
      app: { uuid: "b05c8f6e-4b7d-4c2f-9e0a-6d9b2c5f7081", name: "AskMe" },
      creator: { handle: "lena" },
      title: "Private Q&A",
      description: "Ask me anything, answered on video within 48 hours.",
      accessMode: "PAID",
      priceCents: 1000,
      publishedAt: "2026-09-10T14:20:00Z",
    }),
    [
      approve("2026-09-10T17:45:00Z", { activeSubscriptionCount: 0, oneTimePurchaseCount: 9 }),
      {
        at: "2026-10-12T22:05:00Z",
        change: {
          actions: [
            {
              externalActionId: "custom-video",
              title: "Custom video",
              description: "A personal video on any topic.",
              priceCents: 2500,
            },
          ],
        },
        deliverTwice: true,
      },
    ],
  ),

  // What an action sells changes after approval, then a fan reports it as illegal: E1 and E4.
  ...history(
    experience({
      uuid: "ebf0a1b2-c3d4-4e5f-a6b7-c8d9e0f1a2b3",
      externalExperienceId: "mystery-box",
      app: { uuid: "e38f1c9b-7e0a-4f5c-8b3d-9a2e5f8c0314", name: "Boxed" },
      creator: { handle: "vee" },
      title: "Mystery Box",
      description: "You will not know what is inside until you open it.",
      accessMode: "HIDDEN",
      hidden: true,
      actions: [{ externalActionId: "open", title: "Open the box", description: null, priceCents: 4000 }],
      publishedAt: "2026-09-22T19:00:00Z",
    }),
    [
      approve("2026-09-23T08:00:00Z"),
      {
        at: "2026-10-14T23:40:00Z",
        change: {
          actions: [
            {
              externalActionId: "open",
              title: "Unlock the private folder",
              description: "Files are sent after payment.",
              priceCents: 4000,
            },
          ],
        },
      },
      {
        at: "2026-10-15T07:12:00Z",
        report: {
          reporterUuid: "5a1e2b3c-0000-4000-8000-00000000f001",
          reason: "ILLEGAL",
          feedback: null,
          reportedAt: "2026-10-15T07:12:00Z",
        },
      },
    ],
  ),

  // Cover changed after approval: E2.
  ...history(
    experience({
      uuid: "e4d5e6f7-0819-42a3-b4c5-d6e7f8091a2b",
      externalExperienceId: "backstage-pass",
      app: { uuid: "af4b7e5d-3a6c-4b1e-8d9f-5c8a1b4e6f70", name: "Greenroom" },
      creator: { handle: "theo" },
      title: "Backstage Pass",
      description: "Behind-the-scenes clips from every shoot, posted the same day.",
      experienceType: "VIDEO",
      accessMode: "PAID",
      priceCents: 1500,
      priceRecurring: true,
      publishedAt: "2026-09-05T11:00:00Z",
    }),
    [
      approve("2026-09-05T16:20:00Z", { activeSubscriptionCount: 12, oneTimePurchaseCount: 0 }),
      {
        at: "2026-10-10T21:30:00Z",
        change: {
          imageUrl: "https://placehold.co/1200x630/png?text=Backstage+Pass+v2",
          pendingReviewFields: ["imageUrl"],
        },
      },
    ],
  ),

  // Cover changed before the first approval: the first review sees it, so fine.
  ...history(
    experience({
      uuid: "e5e6f708-192a-43b4-85d6-e7f8091a2b3c",
      externalExperienceId: "lesson-pack-1",
      app: lenswork,
      creator: { handle: "ines" },
      title: "Lesson Pack",
      description: "Three short lessons on lighting a portrait at home.",
      experienceType: "VIDEO",
      publishedAt: "2026-10-16T09:00:00Z",
    }),
    [{ at: "2026-10-16T09:40:00Z", change: { imageUrl: "https://placehold.co/1200x630/png?text=Lesson+Pack+v2" } }],
  ),

  // Type changed to a live stream after approval: E3.
  ...history(
    experience({
      uuid: "a1b2c3d4-e5f6-4789-8abc-def012345678",
      externalExperienceId: "after-hours",
      app: { uuid: "0a9b8c7d-6e5f-4a3b-9c1d-2e3f4a5b6c7d", name: "Arcadia" },
      creator: { handle: "dex" },
      title: "After Hours",
      description: "A late-night arcade with weekly high-score prizes.",
      experienceType: "GAME",
      publishedAt: "2026-09-18T20:00:00Z",
    }),
    [approve("2026-09-19T09:00:00Z"), { at: "2026-10-09T22:00:00Z", change: { experienceType: "LIVE_STREAM" } }],
  ),

  // A live stream served from outside Fanvue: E3.
  ...history(
    experience({
      uuid: "b2c3d4e5-f607-4819-9bcd-ef0123456789",
      externalExperienceId: "gym-live",
      app: { uuid: "1b2c3d4e-5f60-4718-a9b0-c1d2e3f4a5b6", name: "Gymcast" },
      creator: { handle: "nico" },
      title: "Gym Live",
      description: "Train with me live, three mornings a week.",
      experienceType: "LIVE_STREAM",
      deliveryMode: "EXTERNAL",
      externalUrl: "https://live.gymcast.example/nico",
      publishedAt: "2026-10-01T06:00:00Z",
    }),
    [approve("2026-10-01T10:00:00Z")],
  ),

  // Three different fans report it within two days: E4.
  ...history(
    experience({
      uuid: "e9fa0b1c-2d3e-4f50-a1b2-c3d4e5f6a7b8",
      externalExperienceId: "late-night",
      app: { uuid: "d27e0b8a-6d9f-4e4b-9a2c-8f1d4e7b9203", name: "Streamline" },
      creator: { handle: "rocco" },
      title: "Late Night Stream",
      description: "Live every night from midnight. Requests in the chat.",
      experienceType: "LIVE_STREAM",
      accessMode: "PAID",
      priceCents: 2500,
      priceRecurring: true,
      publishedAt: "2026-09-01T23:00:00Z",
    }),
    [
      approve("2026-09-02T10:00:00Z", { activeSubscriptionCount: 61, oneTimePurchaseCount: 0 }),
      {
        at: "2026-10-11T01:12:00Z",
        report: {
          reporterUuid: "5a1e2b3c-0000-4000-8000-00000000a001",
          reason: "OFFENSIVE",
          feedback: "Slurs in the chat.",
          reportedAt: "2026-10-11T01:12:00Z",
        },
      },
      {
        at: "2026-10-11T01:40:00Z",
        report: {
          reporterUuid: "5a1e2b3c-0000-4000-8000-00000000a002",
          reason: "ABUSE",
          feedback: null,
          reportedAt: "2026-10-11T01:40:00Z",
        },
      },
      {
        at: "2026-10-12T00:58:00Z",
        report: {
          reporterUuid: "5a1e2b3c-0000-4000-8000-00000000a003",
          reason: "SPAM",
          feedback: null,
          reportedAt: "2026-10-12T00:58:00Z",
        },
      },
    ],
  ),

  // Four reports from three fans, but never three different fans within 7 days: fine. One report is delivered twice.
  ...history(
    experience({
      uuid: "e3c4d5e6-f708-4192-a3b4-c5d6e7f8091a",
      externalExperienceId: "trivia-weekly",
      app: { uuid: "9e3a6d4c-2f5b-4a0d-bc8e-4b7f0a3d5e69", name: "Quizbox" },
      creator: { handle: "noor" },
      title: "Trivia Tuesday",
      description: "Ten questions every Tuesday at 8pm. The top three get a shout-out.",
      experienceType: "QUIZ",
      accessMode: "SUBSCRIPTION",
      publishedAt: "2026-09-08T19:00:00Z",
    }),
    [
      approve("2026-09-09T09:00:00Z"),
      {
        at: "2026-10-01T20:10:00Z",
        report: {
          reporterUuid: "5a1e2b3c-0000-4000-8000-00000000b001",
          reason: "SPAM",
          feedback: null,
          reportedAt: "2026-10-01T20:10:00Z",
        },
      },
      {
        at: "2026-10-02T20:05:00Z",
        report: {
          reporterUuid: "5a1e2b3c-0000-4000-8000-00000000b001",
          reason: "SPAM",
          feedback: "Still spam.",
          reportedAt: "2026-10-02T20:05:00Z",
        },
      },
      {
        at: "2026-10-03T19:30:00Z",
        report: {
          reporterUuid: "5a1e2b3c-0000-4000-8000-00000000b002",
          reason: "OFFENSIVE",
          feedback: null,
          reportedAt: "2026-10-03T19:30:00Z",
        },
        deliverTwice: true,
      },
      {
        at: "2026-10-20T20:00:00Z",
        report: {
          reporterUuid: "5a1e2b3c-0000-4000-8000-00000000b003",
          reason: "SPAM",
          feedback: null,
          reportedAt: "2026-10-20T20:00:00Z",
        },
      },
    ],
  ),

  // An update that changes nothing a rule reads: fine.
  ...history(
    experience({
      uuid: "e2b3c4d5-e6f7-4081-92a3-b4c5d6e7f809",
      externalExperienceId: "wheel-v2",
      app: { uuid: "8d2f5c3b-1e4a-4f9c-ab7d-3a6e9f2c4d58", name: "Wheelhouse" },
      creator: { handle: "jax" },
      title: "Spin the Wheel",
      description: "Spin for a shout-out, a sticker pack or a custom clip.",
      experienceType: "GAME",
      actions: [
        { externalActionId: "spin", title: "Spin", description: "One spin.", priceCents: 300 },
        { externalActionId: "spin-x5", title: "Five spins", description: "Five spins, one charge.", priceCents: 1200 },
      ],
      publishedAt: "2026-09-12T13:00:00Z",
    }),
    [approve("2026-09-12T18:00:00Z"), { at: "2026-10-06T10:00:00Z" }],
  ),
];

const inOrder = [...drafts].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

/** The history in delivery order. Two events are delivered twice, straight after the first delivery. */
export const experienceEvents: ExperienceEvent[] = inOrder.flatMap(({ deliverTwice, ...draft }, index) => {
  const event: ExperienceEvent = { id: `evt-${String(index + 1).padStart(4, "0")}`, ...draft };
  return deliverTwice ? [event, { ...event }] : [event];
});
