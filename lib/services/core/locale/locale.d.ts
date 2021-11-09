type LocaleConfigType = {
  locale: string; // We use string because users can specify their own locale
  messages: Record<string, string>;
};
