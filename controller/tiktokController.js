const fetch = require("node-fetch");
const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs");
const setTimeDeleteVideo = require('../util/setTimeDeVideo');
const dyVideoParserService = require('../service/dyVideoPaserService');
const puppeteer = require("puppeteer");
const { exit } = require("process");
const { resolve } = require("path");
const { reject } = require("lodash");
const { Headers } = require('node-fetch');
const readline = require('readline');
const headers = new Headers();
const { API, DEFAULT_HEADERS } = require('../util/constants');

const HttpClient = require('../util/httpClient');
const httpClient = new HttpClient();
headers.append('User-Agent', 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet');
const headersWm = new Headers();
headersWm.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36');
const getVideoNoWM = async (url) => {
  console.log(url);
  if (url.includes("douyin", 0)) {
    // const { share_info } = url;

    // if (share_info.indexOf('http') === -1) {
    //     return  'share_info not contain url';
    // }

    try {
      const startIndex = url.indexOf("http");
      const resultStr = url.substring(startIndex);
      const data = await dyVideoParserService.originalUrlFetch(resultStr);
      console.log(data);
      if (!data) {
        return 'original url fetch Error';
      }
      
      const idVideo = await getIdVideo(data.original_url);
      
      const API_URL = `https://api.douyin.wtf/douyin_video_data/?douyin_video_url=${data.original_url}`;
      const request = await fetch(API_URL, {
        method: "GET",
        headers: DEFAULT_HEADERS
      });
      const body = await request.text();
      try {
       // console.log(body);
        var res = JSON.parse(body);
       console.log(res);
      } catch (err) {
        console.error("Error:", err);
        console.error("Response body:", body);
      }
      // const urlMedia = res.aweme_list[0].video.play_addr.url_list[0];
      // const urlMedia1 = res.aweme_list[0].video.play_addr.url_list[1];
      // const descMedia = res.aweme_list[0].desc;
      // const avatarProfile = res.aweme_list[0].author.avatar_thumb.url_list[0];
      // const avatarVideo = res.aweme_list[0].video.cover.url_list[0];
      // const nameProfile = res.aweme_list[0].author.nickname;
      // const aweme_id = idVideo.slice(0,-1);
     
      // const result = {

      //   url: urlMedia,
      //   url1: urlMedia1,
      //   desc: descMedia,
      //   avatar: avatarProfile,
      //   avatarVideo: avatarVideo,
      //   nickname: nameProfile,
      //   aweme_id:aweme_id,
      //   type:"douyin",slide:"no"
      // }

      return res;

    } catch (e) {
      console.log(e);
    }

  } else {
    const idVideo = await getIdVideo(url)
    const API_URL = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;
    const request = await fetch(API_URL, {
      method: "GET",
      headers: headers
    });
    const body = await request.text();
    try {
      var res = JSON.parse(body);
      console.log(res);
    } catch (err) {
      console.error("Error:", err);
      console.error("Response body:", body);
    }
    const urlMedia = res.aweme_list[0].video.play_addr.url_list[0];
    const urlMedia1 = res.aweme_list[0].video.play_addr.url_list[1];
    const descMedia = res.aweme_list[0].desc;
    const avatarProfile = res.aweme_list[0].avatar_thumb;
    const avatarVideo = res.aweme_list[0].video.cover.url_list[0];
    const nameProfile = res.aweme_list[0].author.nickname;
    
    //exec .mp3
    var str = urlMedia.split(".");
    var strData  = str[str.length-1];
    var images=[];
     
    if(strData == "mp3"){
      res.aweme_list[0].image_post_info.images.forEach((e)=>{
        images.push(e.display_image.url_list[0]);
      });
      const data = {

        url: images,
      
        desc: descMedia,
        avatar: avatarProfile,
        avatarVideo: avatarVideo,
        nickname: nameProfile,
        audio: urlMedia,
        aweme_id: idVideo,type:"tiktok",slide:"yes"
      }
      return data; 
    }else{
      const  data = {

        url: urlMedia,
        url1: urlMedia1,
        desc: descMedia,
        avatar: avatarProfile,
        avatarVideo: avatarVideo,
        nickname: nameProfile,
        aweme_id: idVideo,type:"tiktok",slide:"no"
      }
      return data; 
    }
    
    
  }



}


const getRedirectUrl = async (url) => {
  if (url.includes("vm.tiktok.com") || url.includes("vt.tiktok.com")) {
    url = await fetch(url, {
      redirect: "follow",
      follow: 10,
    });
    url = url.url;
    console.log(chalk.green("[*] Redirecting to: " + url));
  }
  return url;
}
const downloadMediaFromList = async (list) => {
  const folder = "./downloads/"
  list.forEach((item) => {
    const fileName = `${item.aweme_id}.mp4`
    const downloadFile = fetch(item.url)
    const file = fs.createWriteStream(folder + fileName);
 
    downloadFile.then(res => {
      res.body.pipe(file)
      file.on("finish", () => {
        file.close()
        resolve()
      });
      file.on("error", (err) => reject(err));
    });
  });
}
const getIdVideo = (url) => {
  const matching = url.includes("/video/")
  if (!matching) {
    console.log(chalk.red("[X] Error: URL not found"));
    
  }
  const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
  return (idVideo.length > 19) ? idVideo.substring(0, idVideo.indexOf("?")) : idVideo;
}
const tiktokController = {
  downloadTiktok: async (req, res) => {
    var listVideo = [];
    var listMedia = [];
    const url = await getRedirectUrl(req.body.url);
    listVideo.push(url);
   
      for (var i = 0; i < listVideo.length; i++) {
        var data = await getVideoNoWM(listVideo[i]);
        listMedia.push(data);
      }
   
    
    console.log(listMedia[0]);
  //   if(listMedia[0].type != "tiktok"){
  //   downloadMediaFromList(listMedia );
  //   setTimeDeleteVideo("./downloads/"+listMedia[0].aweme_id+".mp4");
  // }
    res.status(200).json(listMedia[0]);
    //down load
    //   downloadMediaFromList(listMedia)
    //     .then(() => {

    //         res.status(200).json("Downloaded successfully");
    //     })
    //     .catch(err => {

    //         res.status(500).json("Downloaded fail");
    // });
  },
  showVideoTikTok: async (req,res)=>{
    const nameFile =  req.query.namefile;
    const filePathDirec = "./downloads/"+nameFile+".mp4";
    
    fs.access(filePathDirec, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File does not exist');
        res.status(404).send('File not found');
        return;
      }
  
      // Đọc file và gửi nó dưới dạng phản hồi
      const fileStream = fs.createReadStream(filePathDirec);
      fileStream.pipe(res);
    });
  }
}
module.exports = tiktokController;  