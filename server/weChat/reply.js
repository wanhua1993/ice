const { menu } = require('./menu');
exports.reply = async(ctx, next) => {
    const message = ctx.weixin;
    console.log(message);
    let mp = require('../wechat');
    let client = mp.getWechat();

    // const data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../../ice.jpg'));

    // console.log(data);

    if (message.MsgType == 'text') {
        ctx.body = message.Content;
    } else if (message.MsgType == 'image') {
        ctx.body = {
            msgType: 'image',
            mediaId: message.MediaId
        };
    } else if (message.MsgType == 'voice') {
        ctx.body = {
            msgType: 'voice',
            mediaId: message.MediaId
        };
    } else if (message.MsgType == 'video') {
        ctx.body = {
            title: message.ThumbMediaId,
            msgType: 'video',
            mediaId: message.MediaId
        };
    } else if (message.MsgType == 'location') {
        ctx.body = message.Location_X + ':' + message.Location_Y + ':';
    } else if (message.MsgType == 'link') {
        ctx.body = message.Title;
    } else if (message.MsgType == 'event') {
        if (message.Event == 'subscribe') {
            ctx.body = '关注了!'
        } else if (message.Event == 'unsubscribe') {
            console.log('取关了');
        } else if (message.Event == 'Location') {
            console.log('地址了');
        } else if (message.Event == 'view') {
            ctx.body = message.EventKey + message.MenuId;
        }
    }
}