const express = require('express')
const app = express() //creating a server
const bodyParser= require('body-parser') //gives you provision to post the information from client to server
const MongoClient= require('mongodb').MongoClient //connect server to database
//reference to MongoDB which we are importing as a module

var db;
var s;

MongoClient.connect('mongodb://localhost:27017/Footwear', (err,database) => { //err-url/path  database-callback function
    if(err) return console.log(err) //error during connection, print on consolecls
    db=database.db('Footwear') //reference to Footware database
    app.listen(5000, () => { //calling listen method on express object, callback function
        console.log('Listening at port number 5000') //server is live and listening on port number
    })
})

//setting the middleware
app.set('view engine', 'ejs') //mentioning to server that my view of web page is in terms of ejs
app.use(bodyParser.urlencoded({extended: true})) //the data which we are getting from the client through the body parser module
app.use(bodyParser.json()) //the data which we are getting from the client is in terms of json objects
app.use(express.static('public')) //mentioning to server that public folder is already available to use
//public has css or static files

//we need Home page to be rendered
app.get('/', (req, res) => { //getRequest from client, / indicates home route, callback function with 2 parameters
    db.collection('data').find().toArray((err, result) => { //find all the data, convert json objects into Array, clbk func
        if(err) return console.log(err)
        res.render('homepage.ejs', {data: result}) //render/load the homepage as response, send the result as data variable to homepage
        //result contains all the records of the 'data' collection in the form of array
    })

})

app.get('/create', (req, res) => { //getRequest from client, / indicates home route, callback function with 2 parameters
        res.render('add.ejs') 
    })

app.get('/updatestock', (req, res) => { //getRequest from client, / indicates home route, callback function with 2 parameters
        res.render('update.ejs') 
    })

app.get('/deleteproduct', (req, res) => { //getRequest from client, / indicates home route, callback function with 2 parameters
        res.render('delete.ejs') //load required page
    })

app.post('/AddData', (req, res) => { //getRequest from client, / indicates home route, callback function with 2 parameters
        db.collection('data').save(req.body, (err, result) => { //save the data(contained in req obj) sent from the client into database
            if(err) return console.log(err)

            res.redirect('/') //redirect to homepage instead of rendering all data
        })
    })

app.post('/update', (req, res) => { //getRequest from client, / indicates home route, callback function with 2 parameters

        db.collection('data').find().toArray((err, result) => { //save the data(contained in req obj) sent from the client into database
            if(err) return console.log(err)

            for(var i=0;i<result.length;i++)
            {
                if(result[i].Product_ID == req.body.Product_ID)
                {
                    s=result[i].Quantity //store quantity 
                    break
                }
            }

            db.collection('data').findOneAndUpdate({Product_ID: req.body.Product_ID}, { //find productID which matches with id given by user
                $set: {Quantity: parseInt(s) + parseInt(req.body.Quantity)}}, {sort: {_Product_ID: -1}}, //trying to set stock attribute with new value, converting string into int
                (err,result) => {
                if(err) return res.send(err) //sending error to web page

                console.log(req.body.Product_ID+' stock updated')
                res.redirect('/') //redirect to homepage instead of rendering all data
                })
            })
    })

    app.post('/delete', (req,res) => {
        db.collection('data').findOneAndDelete({Product_ID: req.body.Product_ID}, (err,result) => {
            if(err) return console.log(err)

            res.redirect('/') //redirect to homepage instead of rendering all data
        }
        )
    })
