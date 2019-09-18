export default class User {
    _id: any;
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    permissions: Number;
    activated = false;
    bookmark: [{
        _id: any;
        title: string;
        definition: string;
        validated: boolean;
        published: boolean
    }];
}
