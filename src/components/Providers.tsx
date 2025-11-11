"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize i18n on client side
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </Provider>
  );
}
