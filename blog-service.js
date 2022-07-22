const res = require('express/lib/response');
const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;
var sequelize = new Sequelize('d1roa8hcncgbt1', 'dgsdyibalhoypw', 'e48f1e40cf614f7db6b1f605ad4954e5a9affe0b70b0434b02caed3036cf582e', {
    host: 'ec2-100-26-39-41.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});
var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});
var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});
Post.belongsTo(Category, { foreignKey: 'category' });

function initialize() {

    return new Promise((resolve, reject) => {
        sequelize.sync({ force: false }).
            then(function () {
                resolve('DB connection sucessful.');
            }).catch(err => console.log('error has occured'));


    });
}
function getAllPosts() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            const post_v = Post.findAll();
            post_v.then(() => {
                resolve(post_v);
            }).catch(() => {
                reject("unable to sync data");
            })

        })
    });
}
function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            const post_v = Post.findAll({
                where: { published: true }
            });
            post_v.then(() => {
                resolve(post_v);
            }).catch(() => {
                reject("no result returned");
            })

        })
    });
}
function getPublishedPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            const post_v = Post.findAll({
                where: { category: category, published: true }
            }).then(() => {
                resolve(post_v);
            }).catch(() => {
                reject("no result returned");
            })

        })
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            const category_v = Category.findAll();
            category_v.then(() => {
                resolve(category_v);
            }).catch(() => {
                reject("unable to sync data");
            })

        })
    });
}
function addPost(postData) {

    return new Promise((resolve, reject) => {
        if (postData == null) {

            reject("add data first");
        }
        else {
            for (const prop in postData) {
                if (`postData.${prop}` == " ") {
                    `postData.${prop} = null`;
                }
            }
            postData.published = (postData.published) ? true : false;
            sequelize.sync().then(function () {

                Post.create({
                    body: postData.body,
                    title: postData.title,
                    postDate: postData.postDate,
                    featureImage: postData.featureImage,
                    published: postData.published,
                    category: postData.category
                }).then(() => {
                    resolve(Post);
                }).catch(() => {
                    reject("unable to add data");
                })

            })
        }
    });
}

function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        if (categoryData == null) {

            reject("add data first");
        }
        else {
            sequelize.sync().then(function () {
                console.log("hello4");
                Category.create({
                    category: categoryData.category

                }).then(() => {
                    resolve(Category);

                }).catch(() => {
                    reject("unable to add data");
                })


            })
        }
    });
}

function getPostByCategory(category) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            const post_v = Post.findAll({
                where: { category: category }
            }).then(() => {
                resolve(post_v);
            }).catch(() => {
                reject("no result returned");
            })

        })
    });
}
function getPostsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            const post_v = Post.findAll({
                where: {
                    postDate: {
                        [gte]: new Date(minDateStr)
                    }
                }

            }).then(() => {
                resolve(post_v);
            }).catch(() => {
                reject("no result returned");
            })

        })
    });
}
function getPostById(id) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            const post_v = Post.findAll({
                where: { id: id }
            }).then(() => {
                resolve(post_v);
            }).catch(() => {
                reject("no result returned");
            })

        })
    });
}
function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        const count = Category.destroy({ where: { id: id } });
        count.then(() => {
            resolve(count);
        }).then(() => {
            reject("unable to delete")
        })
    });
}
function deletePostById(id) {
    return new Promise((resolve, reject) => {
        const count = Post.destroy({ where: { id: id } });
        count.then(() => {
            resolve(count);
        }).then(() => {
            reject("unable to delete")
        })
    });
}

module.exports = {
    deletePostById, deleteCategoryById, addCategory, initialize, getAllPosts, getCategories, getPublishedPosts, addPost, getPostByCategory, getPostsByMinDate, getPostById, getPublishedPostsByCategory
}