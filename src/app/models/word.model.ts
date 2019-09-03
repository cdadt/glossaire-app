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
  img: {
    data: string,
    contentType: string,
    size: string
  };
  know_more: string;
  published: boolean;
  legend: string;
  validated: boolean;
}
