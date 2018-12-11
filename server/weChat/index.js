const mongoose = require('mongoose');
const { config } = require('../config');
const Wechat = require('../wechat-lib');
const Token = mongoose.model('Token');
const wechatConfig = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token,
        getAccessToken: async() => await Token.getAccessToken(),
        saveAccessToken: async(data) => await Token.saveAccessToken(data)
    }
}
exports.getWechat = () => {
    const wechatClient = new Wechat(wechatConfig.wechat);
    return wechatClient;
}