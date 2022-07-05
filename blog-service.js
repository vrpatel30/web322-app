const res = require("express/lib/response");

var posts = [];
var categories = [];
function fn() {
    return posts;
}
function initialize() {
    const fs = require("fs");
    return new Promise((resolve, reject) => {
        fs.readFile('./data/categories.json', (err, data) => {
            if (err) {
                reject(err); // calling `reject` will cause the promise to fail with or without the error passed as an argument
                return; // and we don't want to go any further
            }
            else {
                categories = JSON.parse(data);


            }

        });
        fs.readFile('./data/posts.json', (err, data) => {
            if (err) {
                reject(err); // calling `reject` will cause the promise to fail with or without the error passed as an argument
                return; // and we don't want to go any further
            }
            else {
                posts = JSON.parse(data);
                //resolve(posts);
            }

        });

        resolve("operation succeeded");

    });

}
function getAllPosts() {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no data ");
        }
        else {
            resolve(posts);
        }

    });
}
function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no data ");
        }
        else {
            const result = posts.filter(post => post.published == true);
            resolve(result);
        }

    });
}
function getPublishedPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no data ");
        }
        else {
            const result = posts.filter(post => post.published == true&&post.category==category);
            resolve(result);
        }

    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject("no data ");
        }
        else {
            resolve(categories);
        }
    });
}
function addPost(postData) {
    return new Promise((resolve, reject) => {
        if (postData == null) {
            
            reject("add data first");
        }
        else {
           
            if (postData.published == undefined) {

                postData.published = JSON.parse("false");
            }
            else {

                postData.published = JSON.parse("true");
            }
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            today=yyyy+'-'+dd+'-'+mm;
            postData.postDate=today;
            postData.id = posts.length + 1;
            postData
            posts.push(postData);
            resolve(postData)
        }
    })
}

function getPostByCategory(category)
{
    
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no data ");
        }
        else {
            const result = posts.filter(post => post.category ==category);
           
            if(result.length==0)
            {
                return reject("no data found of this category")
            }
            else{
            resolve(result);
            }
        }


    });
}
function getPostsByMinDate(minDateStr){
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no data ");
        }
        else {
          
            const result = posts.filter(post => {
               
                let dt_1= new Date(post.postDate);
                let dt_2= new Date(minDateStr);
                return dt_1>=dt_2;
            });
            if(result.length==0)
            {
                return reject("no data found of this date")
            }
            else{
            resolve(result);
            }
        }


    });
}
function getPostById(id){
    
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no data ");
        }
        else {
       
            const result = posts.filter(post =>post.id == id);
            if(result.length==0)
            {
                
                reject("no record found of this ID")
            }
            resolve(result);
        }

    });
}
module.exports = {
    fn, initialize, getAllPosts, getCategories, getPublishedPosts, addPost,getPostByCategory,getPostsByMinDate,getPostById,getPublishedPostsByCategory
}