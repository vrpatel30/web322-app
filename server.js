/*********************************************************************************
* WEB322 – Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Vivek Rakeshbhai Patel Student ID: 128028206 Date: july 5,2022
*
* Online (Heroku) URL: https://rocky-woodland-96820.herokuapp.com/ 
********************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
const { json, redirect } = require("express/lib/response");
var app = express();
const path = require('path');
const router = express.Router();
//const blog = require("./blog-service");
const blogData = require("./blog-service")
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { query } = require("express");
const res = require("express/lib/response");
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const { Console } = require("console");
app.engine('hbs', exphbs.engine({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context);
        }
    }
}));
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

cloudinary.config({
    cloud_name: 'dg3smtlr4',
    api_key: '885533493491343',
    api_secret: 'FUfMbOyQleEmNXRJIBjbh4Ypkh8',
    secure: true
});
const upload = multer();
var postData = {};


app.get("/", (req, res) => {

    res.redirect("/blog");

});

app.get("/about", (req, res) => {
    res.render('about');
})

app.get("/blog", async (req, res) => {
    let viewData = {};
    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        let post = posts[0];
        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }
   
    res.render("blog", { data: viewData });

})
app.get('/blog/:id', async (req, res) => {
    let viewData = {};

    try {
        let posts = [];
        let post;
        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }
    try {
      
        viewData.post = await blogData.getPostById(req.params.id);
        viewData.post=viewData.post[0];
    } catch (err) {
        viewData.message = "no results";
    }
    try {
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }
 
    res.render("blog", { data: viewData })
});
app.get("/posts", (req, res) => {

    if (req.query.category > 0) {

        blogData.getPostByCategory(req.query.category)
            .then(data => res.render("posts", { posts: data }))
            .catch(err => res.render("posts", { message: "no results" }))
    } else if (req.query.minDate != null) {
        blogData.getPostsByMinDate(req.query.minDate)
            .then(data => res.render("posts", { posts: data }))
            .catch(err => res.render("posts", { message: "no results" }))
    }
    else {
        blogData.getAllPosts()
            .then(data => res.render("posts", { posts: data }))
            .catch(err => res.render("posts", { message: "no results" }))
    }


})

app.get("/categories", (req, res) => {
    blogData.getCategories()
        .then(data => res.render('categories', { categories: data }))
        .catch(err => res.render('categories', { message: "no result" }))
})
app.get("/posts/add", (req, res) => {
    res.render("addPost");
})

app.post("/posts/add", upload.single('featureImage'), function (req, res, next) {


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

    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        postData = {
            "title": req.body.title,
            "body": req.body.body,
            "category": req.body.category,
            "featureImage": req.body.featureImage,
            "published": req.body.published,
            "id": 0
        }
        blogData.addPost(postData).then(function () {
            return res.redirect("/posts");
        }).catch(err => res.send(err))

    })
})
app.get("/posts/:id", (req, res) => {

    blogData.getPostById(req.params.id).then(data => res.send(data)
    ).catch(err => res.send(err))
})
app.get('*', function (req, res) {
    res.status(404).send("404 -page not found");
});


app.use('/', router);
blogData.initialize().then(function (categories, posts) {
    app.listen(HTTP_PORT);
}).catch(() => {
    console.log("no data to display");
})


