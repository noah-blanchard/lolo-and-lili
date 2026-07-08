// No-op Supabase client so components that open realtime channels (e.g.
// NudgeButtons) render without attempting a network connection.
export function createClient() {
  const channel = {
    on: () => channel,
    subscribe: () => ({}) as unknown,
    unsubscribe: () => {},
  };
  return {
    channel: () => channel,
    removeChannel: () => {},
    from: () => ({}),
  };
}
