import en from './translations/en.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import jp from './translations/jp.json';
import zh_CN from './translations/zh-CN.json';
import zh_TW from './translations/zh-TW.json';
import ru from './translations/ru.json';

const resources = {
  en: {
    translation: en,
  },
  jp: {
    translation: jp,
  },
  'zh-TW': {
    translation: zh_TW,
  },
  'zh-CN': {
    translation: zh_CN,
  },
  'ru': {
    translation: ru,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
