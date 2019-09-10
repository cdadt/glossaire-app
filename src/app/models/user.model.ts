export default class User {
    _id: any;
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    permissions: Array<Number>;
    activated = false;
}
