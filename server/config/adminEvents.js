/*
 * ============================================================
 * ADMIN EVENT CONFIGURATION
 * ============================================================
 */

export const ADMIN_EVENTS = [
  {
    id: "llm",

    label: "Workshop",

    name: "Agentic AI Workshop",
  },

  {
    id: "code-build",

    label: "Event 1",

    name: "Code & Build",
  },

  {
    id: "innovation",

    label: "Event 2",

    name: "IT Innovation Challenge",
  },

  {
    id: "cyber-quest",

    label: "Event 3",

    name: "Cyber Quest",
  },

  {
    id: "design-deploy",

    label: "Event 4",

    name: "Design to Deploy",
  },

  {
    id: "tech-connect",

    label: "Event 5",

    name: "Tech Connect",
  },

  {
    id: "event6",

    label: "Event 6",

    name: "Event 6",
  },
];

export function getAdminEvent(
  eventId,
) {
  return (
    ADMIN_EVENTS.find(
      (event) =>
        event.id ===
        eventId,
    ) || null
  );
}