const api = require('../api');
const urlParse = require('url');
const querystring = require('querystring');
const { config } = require('../config');
exports.signature = async(ctx, next) => {
    let url = ctx.query.url;
    if (!url) ctx.throw(404);
    url = decodeURIComponent(url);
    const params = await api.getSignatureAsync(url);
    ctx.body = {
        success: true,
        params
    }
}

exports.redirect = async(ctx, next) => {
    // 获取重定向的链接
    const target = config.SITE_ROOT_URL + '/oauth'; // 回调地址
    const scope = 'snsapi_userinfo';
    const { a, b } = ctx.query;
    const params = `${a}_${b}`;
    // 获取 authorize url 授权地址
    const url = await api.getAuthorizeURL(scope, target, params);
    console.log(url);
    ctx.redirect(url);
}

exports.oauth = async(ctx, next) => {
    let url = ctx.query.url;
    url = decodeURIComponent(url);
    console.log(2322222);
    console.log(url);
    const urlObj = urlParse.parse(url);
    const params = querystring.parse(urlObj.query);
    const code = params.code;
    console.log(code);
    const user = await api.getUserByCode(code);
    console.log(user);
    ctx.body = {
        success: true,
        data: user
    }
}