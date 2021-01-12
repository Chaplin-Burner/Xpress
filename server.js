const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const errorhandler = require('errorhandler');

const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));



app.use('/api', apiRouter);

app.use(errorhandler());

app.listen(PORT, ()=>{
    console.log(`Server is listening on PORT : ${PORT}`);
});

module.exports = app;