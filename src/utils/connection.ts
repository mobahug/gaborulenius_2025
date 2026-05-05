type NavigatorConnection = {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NavigatorConnection;
  mozConnection?: NavigatorConnection;
  webkitConnection?: NavigatorConnection;
};

export const getNetworkConnection = () => {
  const navigatorWithConnection = navigator as NavigatorWithConnection;

  return (
    navigatorWithConnection.connection ??
    navigatorWithConnection.mozConnection ??
    navigatorWithConnection.webkitConnection
  );
};

export const canPrefetchHeavyAsset = () => {
  const connection = getNetworkConnection();

  if (connection?.saveData) {
    return false;
  }

  return !["slow-2g", "2g"].includes(connection?.effectiveType ?? "");
};
