import { hasLocale, IntlErrorCode } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // ko/ja/zh-* mají zatím prázdné messages/*.json (fáze 5, viz docs/09-jazykove-mutace.md) -
    // chybějící klíč má degradovat na název klíče (i v generateMetadata/getTranslations na
    // serveru), ne shodit celý static build dané mutace.
    onError(error) {
      if (error.code !== IntlErrorCode.MISSING_MESSAGE) {
        console.error(error);
      }
    },
    getMessageFallback({ key }) {
      return key;
    },
  };
});
