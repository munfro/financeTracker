var express = require('express')
var app = express()
var router = express.Router()
var path = __dirname +"/pages/" ;
app.use('/',router);

app.use(express.static('pages'))


router.get('/', function(req,res){
	res.sendFile(path+"homepage.html")
})

router.get('/test', function(req,res){
	res.send(frontEnd)
})

app.listen(3000, function() {
})