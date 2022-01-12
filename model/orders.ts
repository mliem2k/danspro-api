const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
	{
		sender_name: { type: String, required: true },
		sender_phone: { type: String, required: true },
		sender_address: { type: String, required: true },
		receiver_name: { type: String, required: true },
		receiver_phone: { type: String, required: true },
		receiver_address: { type: String, required: true },
		item_desc: { type: String, required: true },
		item_weight: { type: String, required: true },
		order_status: { type: String, required: true }
	},
	{ collection: 'orders' }
)

const model = mongoose.model('OrderSchema', OrderSchema)

module.exports = model
