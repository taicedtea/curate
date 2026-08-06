// Auth is deferred (see CLAUDE.md). Every wall created locally belongs to
// this single stand-in profile until real accounts exist.
export const currentUser = {
  id: 'me',
  name: 'Your Name',
  email: 'you@example.com',
  bio: 'Photographer. Editing this profile is coming soon.',
  avatar_url: '',
  followers_count: 0,
}
