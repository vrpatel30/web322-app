/*********************************************************************************
* WEB322 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Vivek Rakeshbhai Patel Student ID: 128028206 Date: june 13,2022
*
* Online (Heroku) URL: https://mysterious-chamber-81060.herokuapp.com/ 
********************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
const { json, redirect } = require("express/lib/response");
var app = express();
const path = require('path');
const router = express.Router();
const blog = require("./blog-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { query } = require("express");
const res = require("express/lib/response");
app.use(express.static('public'));
cloudinary.config({
    cloud_name: 'dg3smtlr4',
    api_key: '885533493491343',
    api_secret: 'FUfMbOyQleEmNXRJIBjbh4Ypkh8',
    secure: true
});
const upload = multer();
var postData={};


app.get("/", (req, res) => {

    res.redirect("/about");

});
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname + '/views/about.html'));
})
app.get("/blog", (req, res) => {

    blog.getPublishedPosts()
        .then(data => res.send(data))
        .catch(err => res.send(err))

})
app.get("/posts",(req, res) => {
    
  if(req.query.category>0)
  {
    blog.getPostByCategory(req.query.category)
             .then(data => res.send(data))
             .catch(err => res.send(err))
  }else if(req.query.minDate!=null){
    blog.getPostsByMinDate(req.query.minDate)
             .then(data => res.send(data))
             .catch(err => res.send(err))
  }
  else{
    blog.getAllPosts()
          .then(data => res.send(data))
          .catch(err => res.send(err))
  }
  
   
})

app.get("/categories", (req, res) => {
    blog.getCategories()
        .then(data => res.send(data))
        .catch(err => res.send(err))
})
app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname + '/views/addPost.html'))
})
app.post("/posts/add",upload.single('featureImage'),function(req,res,next){
   
    
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        return result;
    }

    upload(req).then((uploaded)=>{
        req.body.featureImage=uploaded.url;
        postData={
            "title":req.body.title,
            "body":req.body.body,
            "category":req.body.category,
            "featureImage":req.body.featureImage,
            "published":req.body.published,
            "id":0
        }
        blog.addPost(postData).then(function(){
            return res.redirect("/posts");
        }).catch(err=>res.send(err))
        
    })  
})
app.get("/posts/:id",(req,res)=>{
    
blog.getPostById(req.params.id).then(data=>res.send(data)
).catch(err=>res.send(err))
})
app.get('*', function (req, res) {
    res.status(404).send("404 -page not found");
});


app.use('/', router);
blog.initialize().then(function (categories, posts) {
    app.listen(HTTP_PORT);
}).catch(() => {
    console.log("no data to display");
})


