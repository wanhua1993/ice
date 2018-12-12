const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TicketSchema = new mongoose.Schema({
    name: String,
    ticket: String,
    expires_in: Number,
    meta: {
        created: {
            type: Date,
            default: Date.now()
        },
        updated: {
            type: Date,
            default: Date.now()
        }
    }
});
TicketSchema.pre('save', function(next) {
    if (this.isNew) {
        this.meta.created = this.meta.updated = Date.now();
    } else {
        this.meta.updated = Date.now();
    }
    next();
});
TicketSchema.statics = {
    async getTicket() {
        const ticket = await this.findOne({
            name: 'ticket'
        }).exec();
        if (ticket && ticket.ticket) {
            ticket.ticket = ticket.ticket;
        }
        return ticket;
    },
    async saveTicket(data) {
        let ticket = await this.findOne({
            name: 'ticket'
        }).exec();
        if (ticket) {
            ticket.ticket = data.ticket;
            ticket.expires_in = data.expires_in;
        } else {
            ticket = new ticket({
                name: 'ticket',
                ticket: data.ticket,
                expires_in: data.expires_in
            });
        }
        await ticket.save();
        return data;
    }
}
const Ticket = mongoose.model('Ticket', TicketSchema);