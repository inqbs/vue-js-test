export default class {
    result = false;
    msg = '';
    date = new Date();

    constructor(result, msg, obj){
        Object.assign(this, obj);
        this.result = result;
        this.msg = msg;
    }
}