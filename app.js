const express = require('express');
const cors = require('cors');
const conn = require('./util/database');
const app = express();
const port = 3000;
app.use(cors());
app.listen(port,()=>{
    console.log("server listen port 3000");
})
 //route
 const routeComic = require('./route/comicRoute');

 app.use('/download',routeComic);
 app.use('/douyin',routeComic);
