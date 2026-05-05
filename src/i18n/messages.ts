import enMessages from "./en";

export type AppLocale = "en" | "fi";
export type AppMessages = Record<string, string>;

const messageLoaders: Record<AppLocale, () => Promise<AppMessages>> = {
  en: () => Promise.resolve(enMessages as AppMessages),
  fi: () => import("./fi").then((module) => module.default as AppMessages),
};

const messageCache = new Map<AppLocale, AppMessages>();
// Pre-populate the cache with the synchronously-imported default locale so
// the first paint (including the LCP avatar) is not blocked on an async
// chunk fetch + parse just to render translated copy.
messageCache.set("en", enMessages as AppMessages);

export const getCachedMessages = (locale: AppLocale): AppMessages | null =>
  messageCache.get(locale) ?? null;

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
