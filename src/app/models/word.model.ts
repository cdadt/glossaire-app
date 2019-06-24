export default class Word {
  _id: any;
  title: string;
  last_edit: Date;
  definition: string;
  themes: [{
    _id: any;
    title: string;
  }];
  know_more: string;

  constructor() {
  }
}


