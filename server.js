require("dotenv").config();
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const User = require('./model/user');
const Orders = require('./model/orders');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
var db = mongoose.connection;
const app = express();
app.use(bodyParser.json());
app.post('/api/change-password', async (req, res) => {
    const { token, newpassword: plainTextPassword } = req.body;
    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password' });
    }
    if (plainTextPassword.length < 5) {
        return res.json({
            status: 'error',
            error: 'Password too small. Should be atleast 6 characters'
        });
    }
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const _id = user.id;
        const password = await bcrypt.hash(plainTextPassword, 10);
        await User.updateOne({ _id }, {
            $set: { password }
        });
        res.json({ status: 'ok' });
    }
    catch (error) {
        console.log(error);
        res.json({ status: 'error', error: ';))' });
    }
});
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).lean();
    if (!user) {
        return res.json({ status: 'error', error: 'Invalid username/password' });
    }
    if (await bcrypt.compare(password, user.password)) {
        // the username, password combination is successful
        const token = jwt.sign({
            id: user._id,
            username: user.username
        }, JWT_SECRET, { expiresIn: "15m" });
        return res.json({ status: 'ok', data: token });
    }
    res.json({ status: 'error', error: 'Invalid username/password' });
});
app.post('/api/register', async (req, res) => {
    const { username, password: plainTextPassword } = req.body;
    if (!username || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Invalid username' });
    }
    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password' });
    }
    if (plainTextPassword.length < 5) {
        return res.json({
            status: 'error',
            error: 'Password too small. Should be atleast 6 characters'
        });
    }
    const password = await bcrypt.hash(plainTextPassword, 10);
    try {
        const response = await User.create({
            username,
            password
        });
        console.log('User created successfully: ', response);
    }
    catch (error) {
        if (error.code === 11000) {
            // duplicate key
            return res.json({ status: 'error', error: 'Username already in use' });
        }
        throw error;
    }
    res.json({ status: 'ok' });
});
app.post('/api/orders', validateToken, async (req, res) => {
    const { type, created_at, company, company_url, location, title, description, how_to_apply, company_logo } = req.body;
    try {
        const response = await Orders.create({
            type,
            created_at,
            company,
            company_url,
            location,
            title,
            description,
            how_to_apply,
            company_logo
        });
        console.log('positions created successfully, Tracking id: ', response._id);
    }
    catch (error) {
        if (error.code === 11000) {
            // duplicate key
            return res.json({ status: 'error', error: 'Duplicate Order' });
        }
        throw error;
    }
    res.json({ status: 'ok' });
});
app.get("/posts", validateToken, (req, res) => {
    console.log("Token is valid");
    console.log(req.user.username);
    res.send(`${req.user.username} successfully accessed post`);
});
app.get('/api/recruitment/positions/:order_id', validateToken, async (req, res) => {
    const { order_id } = req.params;
    console.log(JSON.stringify(order_id));
    db.collection('positions').find({ "_id": new ObjectID(order_id) }).toArray((err, result) => {
        if (!err) {
            res.send(result);
        }
        else {
            console.log(err);
        }
    });
}); /*
db.collection('positions').find({ $and: [{ type: /`${test}`/i }, { description: /123/i }] }).toArray((err, result) => { */
app.get('/home', function (req, res) {
    const { type, description } = req.query;
    console.log(type);
    db.collection('positions').find({ $and: [{ type: { $regex: new RegExp(`${type}`), $options: "$i" } }, { description: { $regex: new RegExp(`${description}`), $options: "$i" } }] }).toArray((err, result) => {
        if (!err) {
            res.send(result);
        }
        else {
            console.log(err);
        }
    });
});
app.get('/api/recruitment/positions/:order_id', validateToken, async (req, res) => {
    const { order_id } = req.params;
    console.log(JSON.stringify(order_id));
    db.collection('positions').find({ "_id": new ObjectID(order_id) }).toArray((err, result) => {
        if (!err) {
            res.send(result);
        }
        else {
            console.log(err);
        }
    });
});
app.get('/api/recruitment/positions.json', validateToken, async (req, res) => {
    const { order_id } = req.params;
    console.log(JSON.stringify(order_id));
    db.collection('posistions').find().toArray((err, result) => {
        if (!err) {
            res.send(result);
        }
        else {
            console.log(err);
        }
    });
});
function validateToken(req, res, next) {
    //get token from request header
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    //the request header contains the token "Bearer <token>", split the string and use the second value in the split array.
    if (token == null)
        res.sendStatus(400).send("Token not present");
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.status(403).send("Token invalid");
        }
        else {
            req.user = user;
            next(); //proceed to the next action in the calling function
        }
    }); //end of jwt.verify()
} //end of function
app.listen(3000, () => {
    console.log('Server up at 3000');
});
