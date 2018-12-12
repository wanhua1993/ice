const crypto = require('crypto');
const getRawBody = require('raw-body');
const util = require('./util');

exports.wechatMiddle = (opts, reply) => {
    return async function wechatMiddle(ctx, next) {
        const token = opts.token;
        const {
            signature,
            nonce,
            timestamp,
            echostr
        } = ctx.query;

        const str = [token, timestamp, nonce].sort().join('');
        const sha = crypto.createHash('sha1');
        sha.update(str);
        const sign = sha.digest('hex');
        if (ctx.method == 'GET') {
            if (sign == signature) {
                ctx.body = echostr;
            } else {
                ctx.body = 'Failed';
            }
        } else if (ctx.method == 'POST') {
            if (sign != signature) {
                ctx.body = 'Failed';
                return false;
            }
            const data = await getRawBody(ctx.req, {
                length: ctx.length,
                limit: '1mb',
                encoding: ctx.charset
            });
            // 解析 xml 数据
            const content = await util.parseXML(data);
            const message = util.formatMessage(content.xml);
            ctx.weixin = message;
            // 将 被动回复的消息添加到 body 上
            await reply.apply(ctx, [ctx, next]);

            const replyBody = ctx.body;
            const msg = ctx.weixin;
            const xml = util.tpl(replyBody, msg);
            // const xml = `<xml> 
            // <ToUserName><![CDATA[${content.xml.FromUserName}]]></ToUserName> <FromUserName><![CDATA[${content.xml.ToUserName}]]></FromUserName> <CreateTime>12345678</CreateTime>
            // <MsgType><![CDATA[text]]></MsgType> 
            // <Content><![CDATA[${replyBody}]]></Content>
            // </xml>`;

            ctx.stats = 200;
            ctx.type = 'application/xml';
            ctx.body = xml;
        }
    }
}