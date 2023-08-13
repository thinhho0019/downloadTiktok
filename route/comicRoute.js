const express = require('express');
const tiktokController  = require('../controller/tiktokController')
const { validateParams } = require('../util/validateParams');
const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({extended:true}));
route.post('/tiktok',validateParams(['url']),tiktokController.downloadTiktok);
route.get('/showvideo',tiktokController.showVideoTikTok);
module.exports = route;