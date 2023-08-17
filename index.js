const express = require("express");
const fs = require("fs");
const ejs = require("ejs");
const https = require("https");
const axios = require("axios");
const { load } = require("cheerio");
const bodyParser = require("body-parser");
require('dotenv').config()
const app = express();
const tik = require("tiktod");

const _tiktokurl = "https://www.tiktok.com";
const _tiktokapi = (id) =>
  `https://api16-va.tiktokv.com/aweme/v1/feed/?aweme_id=${id}&version_name=1.1.9&version_code=119&build_number=1.1.9&manifest_version_code=119&update_version_code=119&openudid=dlcrw3zg28ajm4ml&uuid=3703699664470627&_rticket=1677813932976&ts=1677813932&device_brand=Realme&device_type=RMX1821&device_platform=android&resolution=720*1370&dpi=320&os_version=11&os_api=30&carrier_region=US&sys_region=US%C2%AEion=US&app_name=TK%20Downloader&app_language=en&language=en&timezone_name=Western%20Indonesia%20Time&timezone_offset=25200&channel=googleplay&ac=wifi&mcc_mnc=&is_my_cn=0&aid=1180&ssmix=a&as=a1qwert123`;

const RTIK_API = (url) =>
  new Promise((resolve, reject) => {
    url = url.replace("https://vm", "https://vt");
    axios
      .head(url)
      .then(({ request }) => {
        const { responseUrl } = request.res;
        let ID = responseUrl.match(/\d{17,21}/g);
        if (ID === null)
          return resolve({
            status: "error",
            message:
              "Failed to fetch tiktok url. Make sure your tiktok url is correct!",
          });
        ID = ID[0];
        axios
          .get(_tiktokapi(ID))
          .then(({ data }) => {
            const content = data.aweme_list.filter((v) => v.aweme_id === ID)[0];
            if (!content)
              return resolve({
                status: "error",
                message:
                  "Failed to find tiktok data. Make sure your tiktok url is correct!",
              });
            const statistics = {
              playCount: content.statistics.play_count,
              downloadCount: content.statistics.download_count,
              shareCount: content.statistics.share_count,
              commentCount: content.statistics.comment_count,
              likeCount: content.statistics.digg_count,
              favoriteCount: content.statistics.collect_count,
            };
            const author = {
              username: content.author.unique_id,
              nickname: content.author.nickname,
              signature: content.author.signature,
              birthday: content.author.birthday,
              region: content.author.region,
            };
            if (content.image_post_info) {
              resolve({
                status: "success",
                result: {
                  type: "image",
                  id: content.aweme_id,
                  createTime: content.create_time,
                  description: content.desc,
                  author,
                  statistics,
                  images: content.image_post_info.images.map(
                    (v) => v.display_image.url_list[0]
                  ),
                  music: content.music.play_url.url_list,
                },
              });
            } else {
              resolve({
                status: "success",
                result: {
                  type: "video",
                  id: content.aweme_id,
                  createTime: content.create_time,
                  description: content.desc,
                  author,
                  statistics,
                  video: content.video.play_addr.url_list,
                  cover: content.video.cover.url_list,
                  dynamic_cover: content.video.dynamic_cover.url_list,
                  music: content.music.play_url.url_list,
                },
              });
            }
          })
          .catch((e) => resolve({ status: "error", message: e.message }));
      })
      .catch((e) => resolve({ status: "error", message: e.message }));
  });

app.set("views", __dirname + "/public");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", async (req, res) => {
  res.status(200);
  res.render("pages/index");
});
app.post("/download", async (req, res) => {
  let url = req.body.url;
  console.log(url)
  tik.download(req.body.url).then((rtik) => {
    console.log(rtik)
    if (rtik.status == 500) {
       res.redirect("/");
    } else {
      let id = "RTik-" + rtik.result.stats.aweme_id;
      console.log(`Starting download: \nURL: ${url}`);
      res.status(200);
      res.render("pages/download", { rtik, url, id });
    }
  });
});
app.get("/download", async (req, res) => {
  let url = req.query.url;
  let type = req.query.type;
  let id = req.query.id;
  tik.download(url).then((rtik) => {
    if (rtik.status == 500) {
      res.redirect("/");
    } else {
      if (type == "mp4") {
        const path = process.cwd() + `/temp/media/${type}/${id}.mp4`;
        const requ = https.get(rtik.result.media, (response) => {
          const file = fs.createWriteStream(path);
          response.pipe(file);
          file.on("error", function (err) {
            console.log("err", err);
          });
          file.on("finish", function () {
            file.close();
            res.status(200);
            try {
              res.download(`./temp/media/${type}/${id}.mp4`, {
                root: __dirname,
              });
            } catch (error) {
              console.error(error);
            }
          });
        });
        requ.on("err", (error) => {
          console.log("error", error);
        });
      } else if (type == "mp3") {
        const path = process.cwd() + `/temp/media/${type}/${id}.mp3`;
        const requ = https.get(rtik.result.music.url, (response) => {
          const file = fs.createWriteStream(path);
          response.pipe(file);
          file.on("error", function (err) {
            console.log("err", err);
          });
          file.on("finish", function () {
            file.close();
            res.status(200);
            try {
              res.download(`./temp/media/${type}/${id}.mp3`, {
                root: __dirname,
              });
            } catch (error) {
              console.error(error);
            }
          });
        });
        requ.on("err", (error) => {
          console.log("error", error);
        });
      }
    }
  });
});

app.get("*", async (req, res) => {
  res.redirect("/");
});
app.listen(process.env.PORT, () => {
  console.log(`[SYSTEM] RTIK is Running.. {}`);
});
