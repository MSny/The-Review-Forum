//Declare npm module dependencies 
var express = require('express');
var app = express();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('forum.db');

var ejs = require('ejs');
app.set('view_engine', 'ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

var methodOverride = require('method-override');
app.use(methodOverride('_method'));
// Instagram search for category pictures
var request = require("request");
var instagramString = ""
var secrets = require("./secrets.json");
var apiKey = secrets["instaAPI"];
var instaImg = ""
// Sendgrid action
var sendgrid  = require('sendgrid')("msny36", "gogeta123");

//Markdown to html npm (marked)
var marked = require('marked');
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

// var bootstrap = require('bootstrap');
// app.use(express.static(__The-Review-Forum+ '/bootstrap'));

//declare port that it operates on
var port = 3000;

///////////////////////////////////////////////////////////////////////
//declare primary redirect for home. 
app.get('/', function(req, res){
	res.redirect('/forum')
});
//forum page 
app.get('/forum', function (req, res){
	db.all("SELECT * FROM category", function(err, data){
		if (err){
			console.log(err)
		} else {
			var category = data;
			if(req.query.offset === undefined) { req.query.offset = 0; }
  			db.all("SELECT posts.title, posts.post, posts.id, category_id FROM posts LIMIT 10 OFFSET ?", req.query.offset, function(err, data1) {
    			//console.log(data1)
    			db.all("SELECT category.title, category.id FROM category", function(err, data2) {
      				//console.log(data2)
      				res.render("index.ejs", {
					category: category,
        			pTitles: data1,
        			cTitles: data2,
        			pagination: parseInt(req.query.offset) + 10,});
				});
			});

      	}
    });
})

///////////////////////////////////////////////////////////////////////

//show all created categories on /category
app.get('/category', function (req, res){
	db.all("SELECT * FROM category", function(err, data){
		if (err){
			console.log(err)
		} else {
			var category = data;
			// console.log(category);
		} res.render("category.ejs", {category: category});
	});
});
///////////////////////////////////////////////////////////////////////

// render create category page
app.get('/category/new', function (req, res){
	var instaImg = "";
	var instaURL = "";
	res.render('categoryNew.ejs', {instaURL: instaURL})
});
////////////////////////////////////////////////////////
// Search Instagram API and grabs url
app.post('/category/new', function (req, res){
	var instaImg = ""
	instagramString += "https://api.instagram.com/v1/tags/"+req.body.search+"/media/recent?client_id="+apiKey
	console.log(instagramString);
	if (instaImg.length < 2){
		request(instagramString,function(err,response, body){
			var instaImg = "";
			if (err){
				console.log(err)
			} if (instaImg.length < 2){
				var parsedI = JSON.parse(body);
				console.log(parsedI)
				instaImg = parsedI.data[5].images.standard_resolution.url;
				instaURL= instaImg;
				console.log(instaImg);
				instagramString = ""
				res.render('categoryNew.ejs', {instaURL: instaURL})
			}
		})}
	if (instaImg.length > 2){
			var instaImg = ""
			instagramString = "";
		}
	})
		
		// instaPicURL += instaImg;
//create new categories
app.post("/category", function (req, res){
	db.run("INSERT INTO category (title, description, author, pic, vote) VALUES (?, ?, ?, ?, ?)", req.body.title, req.body.description, req.body.author, req.body.pic, req.body.vote, function (err) {
		if (err) console.log(err);
	})
	res.redirect("/forum")
})

///////////////////////////////////////////////////////////////////////

//add upvote or downvote to category
app.put("/category/:id", function (req, res) {
	var id = req.params.id
	var voteUp = 0
	if (req.body.Upvote === '+1') {
		voteUp = voteUp +1	
	}
	if (req.body.Downvote === '-1') {
		voteUp = voteUp -1;
	}	
	db.run('UPDATE category SET vote = vote + ? WHERE id = ?',voteUp, id,  function (err){
		if (err) {
			console.log(err)
		} 
		else {
			res.redirect('/');
		}
	})
});
///////////////////////////////////////////////////////////////////////

// create posts page for a selected category & show posts that are still alive. 
app.get("/category/:id", function (req, res){
	var id = req.params.id
	db.all("SELECT * FROM posts WHERE category_id="+id+" AND timetolive > strftime('%Y-%m-%d %H:%M:%S','now')", function(err, data){
		if (err){
			console.log(err)
		} else {
			var post = data;
			db.all("SELECT * FROM category", function(err, data){
				var category = data;
				db.all("SELECT posts.title FROM posts WHERE category_id="+id+" AND timetolive < strftime('%Y-%m-%d %H:%M:%S','now');", function(err, data){
					var deadpost = data;
					console.log(deadpost)
				//console.log(id);
				res.render("post.ejs", {post: post, category: category, id: id, deadpost:deadpost});
			})
			})
		}});
			// console.log(category);
	});

// app.get("/category/:id", function (req, res){
// 	var id = req.params.id
// 	db.all("SELECT posts.title FROM posts WHERE timetolive < strftime('%Y-%m-%d %H:%M:%S','now');", function(err, data){
// 		if (err){
// 			console.log(err)
// 		} else {
// 			var deadpost = data;
// 			console.log(deadpost);
// 			res.render("post.ejs", {postdead: postdead});
// 		}
// 	});
// });
			
///////////////////////////////////////////////////////////////////////

app.post("/posts", function (req, res){
	db.run("INSERT INTO posts (title, post, author, category_id, vote, timetolive) VALUES (?, ?, ?, ?, ?, ?)", req.body.title, req.body.post, req.body.author, req.body.category_id, req.body.vote, req.body.timetolive, function (err) {
		if (err) console.log(err);
	});
	res.redirect('/')
});
///////////////////////////////////////////////////////////////////////

//Show specific post within page
app.get('/post/full/:id', function (req, res){
	var postId = req.params.id
	db.all("SELECT * FROM posts WHERE id = "+postId, function (err, data){
		if (err){
			console.log(err)
		} else {
			//Convert html to markdown
			console.log(data)
			var markdownArr = []
			for (var i = 0; i< data.length; i++){
				markdownArr.push(data[i])
			}

			var markdownArrPost = []
			markdownArrPost.push(markdownArr[0].post)
			//console.log(markdownArrPost);
			var mark = markdownArrPost.toString()
			var marky = marked(mark)
			 
			var postData = data
			res.render('fullPost.ejs', {postData: postData, postId: postId, marky: marky});
		}
	})
});
///////////////////////////////////////////////////////////////////////

//Delete posts
// app.delete('/post/full/:id', function(req, res){
// 	db.all("DELETE FROM posts WHERE category_id = ?", req.params.id, function(err,){
// 		res.redirect("/forum")
// 	})
// })

//If there are no posts in category, delete category enable
app.delete("/category/:id", function(req, res) {
  db.all("SELECT * FROM posts WHERE category_id = ?", req.params.id, function(err, data) {
    if (data.length === 0) {
      db.run("DELETE FROM category WHERE id = ?", req.params.id, function(err) {
        res.redirect("/")
      })
    } else {
      db.get("SELECT categories.title, categories.id FROM categories WHERE id = ?", req.params.id, function(err, data1) {
        db.all("SELECT posts.title, posts.id FROM posts WHERE category_id = ?", req.params.id, function(err, data2) {
          res.render("index.ejs", {
            thisCategory: data1,
            posts: data2,
            err: "Cannot delete categories with posts"
          })
        });
      });
    }
  });
});
///////////////////////////////////////////////////////////////////////


//upvote downvote posts
app.put('/post/full/:id', function (req, res) {
	var id = req.params.id
	console.log("params ID =" + id);
	var voteUp = 0
	if (req.body.Upvote === '+1') {
		voteUp = voteUp +1	
	}
	if (req.body.Downvote === '-1') {
		voteUp = voteUp -1;
	}	
	db.run('UPDATE posts SET vote = vote + ? WHERE id = ?',voteUp, id,  function (err){
		console.log("hi there"+id)
		if (err) {
			console.log(err)
		} 
		else {
			res.redirect('/');
		}
	})
});
///////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////
// This page is going to show all posts and all categories
app.get("/posts/all", function(req, res) {
  if(req.query.offset === undefined) { req.query.offset = 0; }
  db.all("SELECT posts.title, posts.post, posts.id, category_id FROM posts LIMIT 10 OFFSET ?", req.query.offset, function(err, data1) {
    //console.log(data1)
    db.all("SELECT category.title, category.id FROM category", function(err, data2) {
      //console.log(data2)
      res.render("allPosts.ejs", {
        pTitles: data1,
        cTitles: data2,
        pagination: parseInt(req.query.offset) + 10,
      })
    });
  });
});

//////////////////////////////////////////////////////////////////////
// Sendgrid
// Add email to subscriptions page
// app.post("/subscriptions", function (req, res){
// 	db.run("INSERT INTO subscriptions (email) VALUES (?)", req.body.email, function(err){
// 		res.redirect("/category/"+ req.body.category_id)
// 	});
// });
// // Add the new post to your category page and email it to myself. Look at sendgrid2 branch to see my attempt at pulling emails from subscriptions table(unsuccessful so far)
// app.post("/category/:id", function(req, res) {
//   db.run("INSERT INTO posts (title, post, author, category_id) VALUES(?, ?, ?, ?)", req.body.title, req.body.body, req.body.image, req.params.id, function(err) {
//     var email     = new sendgrid.Email({
//   to:       'msny36@gmail.com',
//   from:     'msny36@gmail.com',
//   subject:  req.body.title,
//   text:     req.body.body
// });
// sendgrid.send(email, function(err, json) {
//   if (err) { return console.error(err); }
//   console.log(json);
// });
//     res.redirect("/category/" + req.params.id)
//   });

// });

//listen and startup log
app.listen(3000);
console.log("I've started!");