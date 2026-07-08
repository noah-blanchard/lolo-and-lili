export function usePush() {
  return {
    supported: false,
    permission: "default" as NotificationPermission,
    subscribed: false,
    isIOS: false,
    isStandalone: false,
    iosNeedsInstall: false,
    busy: false,
    subscribe: async () => false,
    unsubscribe: async () => {},
    sendTest: async () => {},
  };
}
