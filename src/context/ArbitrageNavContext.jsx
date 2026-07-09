import { createContext, useContext, useMemo, useState } from "react";

const defaultNav = {
  loading: null,
  view: null,
  arbSource: null,
  onRunScrape: null,
  onFetchTop10: null,
  onFetchAudit: null,
};

const ArbitrageNavContext = createContext({
  nav: defaultNav,
  setNav: () => {},
});

export function ArbitrageNavProvider({ children }) {
  const [nav, setNav] = useState(defaultNav);
  const value = useMemo(() => ({ nav, setNav }), [nav]);
  return (
    <ArbitrageNavContext.Provider value={value}>
      {children}
    </ArbitrageNavContext.Provider>
  );
}

export function useArbitrageNav() {
  return useContext(ArbitrageNavContext);
}
