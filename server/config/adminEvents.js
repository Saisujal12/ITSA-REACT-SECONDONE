/* Each admin selection has its own password hash and registration sheet. */
export const ADMIN_EVENTS = [
  { id: 'llm', label: 'Workshop', name: 'Agentic AI Workshop', passwordHashEnv: 'ADMIN_PASSWORD_HASH_LLM' },
  { id: 'code-build', label: 'Event 1', name: 'Code & Build', passwordHashEnv: 'ADMIN_PASSWORD_HASH_CODE_BUILD' },
  { id: 'innovation', label: 'Event 2', name: 'IT Innovation Challenge', passwordHashEnv: 'ADMIN_PASSWORD_HASH_INNOVATION' },
  { id: 'cyber-quest', label: 'Event 3', name: 'Cyber Quest', passwordHashEnv: 'ADMIN_PASSWORD_HASH_CYBER_QUEST' },
  { id: 'design-deploy', label: 'Event 4', name: 'Design to Deploy', passwordHashEnv: 'ADMIN_PASSWORD_HASH_DESIGN_DEPLOY' },
  { id: 'tech-connect', label: 'Event 5', name: 'Tech Connect', passwordHashEnv: 'ADMIN_PASSWORD_HASH_TECH_CONNECT' },
  { id: 'event6', label: 'Event 6', name: 'Future Forge', passwordHashEnv: 'ADMIN_PASSWORD_HASH_EVENT6' },
  { id: 'event7', label: 'Event 7', name: 'App Innovators', passwordHashEnv: 'ADMIN_PASSWORD_HASH_EVENT7' },
  { id: 'event8', label: 'Event 8', name: 'Data Quest', passwordHashEnv: 'ADMIN_PASSWORD_HASH_EVENT8' },
  { id: 'event9', label: 'Event 9', name: 'Pixel Perfect', passwordHashEnv: 'ADMIN_PASSWORD_HASH_EVENT9' },
  { id: 'event10', label: 'Event 10', name: 'Tech Trivia', passwordHashEnv: 'ADMIN_PASSWORD_HASH_EVENT10' },
];

export function getAdminEvent(eventId) {
  return ADMIN_EVENTS.find((event) => event.id === eventId) || null;
}
