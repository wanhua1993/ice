import axios from 'axios';
const baseUrl = 'http://aichi.free.idcfengye.com';

class Services {
    getWechatSignature(url) {
        let val = axios.get(`${baseUrl}/wechat-signature?url=${url}`);
        return val
    }

    getUserByOAuth(url) {
        console.log(url);
        let val = axios.get(`${baseUrl}/wechat-oauth?url=${url}`);
        console.log(val);
        return val
    }
}
export default new Services();