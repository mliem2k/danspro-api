const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    type: { type: String, required: true },
    created_at: { type: String, required: true },
    company: { type: String, required: true },
    company_url: { type: String, required: true },
    location: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    how_to_apply: { type: String, required: true },
    company_logo: { type: String, required: true }
}, { collection: 'positions' });
const model = mongoose.model('OrderSchema', OrderSchema);
module.exports = model;
