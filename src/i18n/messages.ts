export type AppLocale = "en" | "fi";
export type AppMessages = Record<string, string>;

const messageLoaders: Record<AppLocale, () => Promise<AppMessages>> = {
  en: () => import("./en").then((module) => module.default as AppMessages),
  fi: () => import("./fi").then((module) => module.default as AppMessages),
};

const messageCache = new Map<AppLocale, AppMessages>();

export const loadMessages = async (locale: AppLocale) => {
  const cachedMessages = messageCache.get(locale);
  if (cachedMessages) {
    return cachedMessages;
  }

  const loadedMessages = await messageLoaders[locale]();
  messageCache.set(locale, loadedMessages);
  return loadedMessages;
};

export const preloadMessages = (locale: AppLocale) => {
  void loadMessages(locale);
};
