const xml2js = require('xml2js');
const template = require('./tpl');
exports.parseXML = async(xml) => {
    return new Promise((reslove, reject) => {
        xml2js.parseString(xml, {
            trim: true
        }, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                reslove(data);
            }
        })
    });
}

exports.formatMessage = (result) => {
    let message = {};
    if (typeof result == 'object') {
        const keys = Object.keys(result);
        for (let i = 0; i < keys.length; i++) {
            let item = result[keys[i]];
            let key = keys[i];
            if (!(item instanceof Array) || item.length == 0) {
                continue
            }
            if (item.length == 1) {
                let val = item[0];
                if (typeof val == 'object') {
                    message[key] = formatMessage(vale);
                } else {
                    message[key] = (val || '').trim();
                }
            } else {
                message[key] = [];
                for (let j = 0; j < item.length; j++) {
                    message[key].push(formatMessage(item[j]))
                }
            }
        }
    }
    return message;
}

exports.tpl = (content, message) => {
    let info = {}
    let type = 'text';
    if (Array.isArray(content)) {
        type = 'news'
    }
    if (!content) {
        content = 'Empty News';
    }
    if (content && content.type) {
        type = content.type;
    }
    type = content.type || type;
    info = Object.assign({}, {
        content: content,
        createTime: new Date().getTime(),
        msgType: type,
        toUserName: message.FromUserName,
        fromUserName: message.ToUserName
    });
    return template.compiled(info);
}