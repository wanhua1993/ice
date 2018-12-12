const xml2js = require('xml2js');
const template = require('./tpl');
const crypto = require('crypto');

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

function createNonce() {
    return Math.random().toString(36).substr(2, 15);
}

function createTimestamp() {
    return parseInt(new Date().getTime() / 1000, 0) + '';
}

function raw(args) {
    let str = '';
    let newArgs = {};

    let keys = Object.keys(args);
    keys = keys.sort();

    keys.forEach((key) => {
        newArgs[key.toLowerCase()] = args[key];
    });

    for (let k in newArgs) {
        str += '&' + k + '=' + newArgs[k];
    }

    return str.substr(1);
}

function signIt(nonce, ticket, timestamp, url) {
    const ret = {
        jsapi_ticket: ticket,
        nonceStr: nonce,
        timestamp,
        url
    }

    const string = raw(ret);
    const sha = crypto.createHash('sha1');
    sha.update(string);
    const sign = sha.digest('hex');
    return sign;
}
exports.sign = (ticket, url) => {
    const nonce = createNonce();
    const timestamp = createTimestamp();
    const signature = signIt(nonce, ticket, timestamp, url);
    return {
        noncestr: nonce,
        timestamp,
        signature
    }
}