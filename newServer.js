const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.json())

var currentKey = "" // Retrieve from user's JWT via HTTP header
var currentPassword = ""

function authenticateToken(req,res,next){
    try {
        let authHeader = req.headers.authorization
        if(!req.headers.authorization){
            res.status(401).redirect("/identify")
        } 
        let token = authHeader.split(' ')[1]
        let user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) >= {
            if (err){
                return res.status(401).redirect('/identify')
            }
        })
        next()
    }
    catch(err){
        res.status(401).json(err.message)
    }
}

app.get('/', (req,res) => {
    res.redirect('/identify')
})

app.post('/identify', async (req, res) => {

    if(req.body.name !== "" && req.body.password !== "" && !!(await db.userExists(req.body.userId))){
        try{       
            let currentPassword = await bcrypt.hash(req.body.password,10)
            if (await db.verifyUser(req.body.name, currentPassword)){   // if user input does not match DB entry
                res.render('fail.ejs')
            }
            else{
                const data = {id: req.body.userId, name: req.body.name, role: await db.getRole(req.body.userId) }
                let token = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET)  // Send JWT to user via HTTP response
                res.json({JWT: token}).status(200).redirect("/granted")
            }
        }
        catch (e){
            console.log("Error", e.stack)
            console.log("Error", e.name)
            console.log("Error", e.message)
        }
    }
    else{
        res.redirect('/identify')
    }
})

app.get('/identify', (req, res) => {
    res.render('identify.ejs')
})

app.get('/granted', authenticateToken, (req, res) => {
    res.render('start.ejs')
})

app.get('/admin', (req, res) => {
    res.render('admin.ejs')
})

app.listen(8000)