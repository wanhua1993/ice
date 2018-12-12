import axios from 'axios';
const baseUrl = 'http://aichi.free.idcfengye.com';

class Services {
    getWechatSignature(url) {
        let val = axios.get(`${baseUrl}/wechat-signature?url=${url}`);
        console.log(val);
        return val
    }
}
export default new Services();