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
			//console.log(category);
		} res.render("index.ejs", {category: category});
	});
});

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
// render create category page
app.get('/category/new', function (req, res){
	res.render('categoryNew.ejs')
});
//create new categories
app.post("/category", function (req, res){
	db.run("INSERT INTO category (title, description, author, pic, vote) VALUES (?, ?, ?, ?, ?)", req.body.title, req.body.description, req.body.author, req.body.pic, req.body.vote, function (err) {
		if (err) console.log(err);
	})
	res.redirect("/forum")
})
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

// create posts page for a selected category
app.get("/category/:id", function (req, res){
	var id = req.params.id
	db.all("SELECT * FROM posts WHERE category_id="+id, function(err, data){
		if (err){
			console.log(err)
		} else {
			var post = data;
			db.all("SELECT * FROM category", function(err, data){
				var category = data;
				//console.log(id);
				res.render("post.ejs", {post: post, category: category, id: id});
			})
		}});
			// console.log(category);
	});
			

app.post("/posts", function (req, res){
	db.run("INSERT INTO posts (title, post, author, category_id, vote) VALUES (?, ?, ?, ?, ?)", req.body.title, req.body.post, req.body.author, req.body.category_id, req.body.vote, function (err) {
		if (err) console.log(err);
	});
	res.redirect('/')
});

app.get('/post/full/:id', function (req, res){
	var postId = req.params.id
	db.all("SELECT * FROM posts WHERE id = "+postId, function (err, data){
		if (err){
			console.log(err)
		} else {
			//Convert html to markdown
			var markdownArr = []
			for (var i = 0; i< data.length; i++){
				markdownArr.push(data[i])
			}
			//console.log(markdownArr);
			var markdownArrPost = []
			markdownArrPost.push(markdownArr[0].post)
			console.log(markdownArrPost);
			var mark = markdownArrPost.toString()
			var marky = marked(mark)
			 
			var postData = data
			res.render('fullPost.ejs', {postData: postData, postId: postId, marky: marky});
		}
	})
});


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

// see all forum posts. 
app.get('/posts/all', function (req, res){
	db.all("SELECT * FROM posts", function(err, data){
		if (err){
			console.log(err)
		} else {
			var posts = data;
			var start = 0;
			var end = 10;
			var first10 = posts.slice(start, end)
			//console.log(first10);
			// console.log(category);
		} res.render("allPosts.ejs", {posts: posts, first10: first10});
	});
});

//listen and startup log
app.listen(3000);
console.log("I've started!");