const { getWechat } = require('../weChat');

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