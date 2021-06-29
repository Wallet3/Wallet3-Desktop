import Store from 'electron-store';

type Schema = {
  keyIndex: number;
};

export default new Store<Schema>();
