import i18n from '../../i18n';
import { makeAutoObservable } from 'mobx';
import store from 'storejs';

interface Lang {
  flag: string;
  name: string;
  value: string;
}

export class LangsVM {
  currentLang: Lang = null;

  supportedLangs: Lang[] = [
    { flag: 'usa', name: 'English', value: 'en' },
    { flag: 'jp', name: '日本語', value: 'jp' },
    { flag: 'cn', name: '简体中文', value: 'zh-cn' },
  ];

  constructor() {
    makeAutoObservable(this);

    this.currentLang =
      this.supportedLangs.find((l) => l.value === (store.get('lang') || navigator.language?.toLowerCase())) ||
      this.supportedLangs[0];

    i18n.changeLanguage(this.currentLang.value);
  }

  setLang(lang: Lang) {
    this.currentLang = lang;
    store.set('lang', lang.value);
    i18n.changeLanguage(lang.value);
  }
}

export default new LangsVM();
