// This is a workaround as vite failes to resolves the environment variables
export const variables = {
  collabRooms: import.meta.env.VITE_COLLAB_ROOMS,
}
