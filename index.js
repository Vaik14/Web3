const express = require('express');
const transferRouter = require('./src/routes/api');

const app = express();
app.use('/api', transferRouter);

const PORT = 3000;


function onStart(){
    console.log(`Server running on port ${PORT}`);
}

app.listen(PORT, onStart);

module.exports = app;
