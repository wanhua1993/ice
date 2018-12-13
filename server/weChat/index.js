const mongoose = require('mongoose');
const { config } = require('../config');
const Wechat = require('../wechat-lib');
const WechatOAuth = require('../wechat-lib/oauth');
const Token = mongoose.model('Token');
const Ticket = mongoose.model('Ticket');
const wechatConfig = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token,
        getAccessToken: async() => await Token.getAccessToken(),
        saveAccessToken: async(data) => await Token.saveAccessToken(data),
        getTicket: async() => await Ticket.getTicket(),
        saveTicket: async(data) => await Ticket.saveTicket(data),
    }
}
exports.getWechat = () => {
    const wechatClient = new Wechat(wechatConfig.wechat);
    return wechatClient;
}

exports.getOAuth = () => {
    const oauth = new WechatOAuth(wechatConfig.wechat);
    return oauth;
}