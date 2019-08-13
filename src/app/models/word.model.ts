export default class Word {
  _id: any;
  title: string;
  last_edit: Date;
  definition: string;
  themes: [{
    _id: any;
    title: string;
    published: string;
  }];
  know_more: string;
}
