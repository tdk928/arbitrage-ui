import { createContext, useCallback, useContext, useMemo, useState } from "react";

const UsersRefreshContext = createContext({
  refreshKey: 0,
  requestUsersRefresh: () => {},
});

export function UsersRefreshProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const requestUsersRefresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const value = useMemo(
    () => ({ refreshKey, requestUsersRefresh }),
    [refreshKey, requestUsersRefresh]
  );

  return (
    <UsersRefreshContext.Provider value={value}>
      {children}
    </UsersRefreshContext.Provider>
  );
}

export function useUsersRefresh() {
  return useContext(UsersRefreshContext);
}
