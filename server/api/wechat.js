const { getWechat, getOAuth } = require('../weChat');

const client = getWechat();

exports.getSignatureAsync = async(url) => {
    const data = await client.fetchAccessToken();
    const token = data.access_token;
    const ticketDate = await client.fetchTicket(token);
    const ticket = ticketDate.ticket;

    let params = client.sign(ticket, url);
    params.appId = client.appID;

    return params;
}

exports.getAuthorizeURL = async(...args) => {
    const oauth = getOAuth();
    return oauth.getAuthorizeURL(...args);
}

exports.getUserByCode = async(code) => {
    const oauth = getOAuth();
    const data = await oauth.fetchAccessToken(code);
    console.log(data);
    const user = await oauth.getUserInfo(data.access_token, data.openid);
    return user;
}