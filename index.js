require('dotenv').config();
require('./database/connector')();

const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cors());
app.use(errorHandler);
app.use('/api/auth', require('./routes/auth'))
app.use('/api/create', require('./routes/createData'))
app.use('/api/read', require('./routes/readData'))
app.use('/api/update', require('./routes/updateData'))
app.use('/api/delete', require('./routes/deleteData'))
app.set('json spaces', 1)

app.get('/', async (req, res) => {
    res.sendStatus(403)
})

app.get('/status', async (req, res) => {
    res.sendStatus(200)
})

app.get('*', async (req, res) => {
    res.sendStatus(404)

})


const PORT = process.env.PORT || 6060;
app.listen(PORT, () => {
    console.log(`[^] Server is running on port ${PORT}`);
})