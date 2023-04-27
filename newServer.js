const express = require('express')
const app = express()
const db = require('./database')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
require('dotenv').config()

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieParser())

var currentKey = "" // Retrieve from user's JWT via HTTP header
var currentPassword = ""

function authenticateToken(req,res,next){
    try {
        let authHeader = req.cookies.token
        console.log(authHeader) 
        let user = jwt.verify(authHeader, process.env.ACCESS_TOKEN_SECRET)
        next()
        return
    }
    catch(err){
        res.status(401, {message: err.message}).render('fail.ejs')
    }
}

app.get('/', (req,res) => {
    res.redirect('/identify')
})

app.post('/identify', async (req, res) => {
    if(req.body.name !== "" && req.body.password !== "" && !!(await db.userExists(req.body.name))){
        try{       
            console.log(await db.userExists(req.body.name))
            let encPass = (await db.verifyUser(req.body.name))
            console.log(encPass)
            let userVerification = (!!encPass && (await bcrypt.compare(req.body.password, encPass.password)))
            console.log(userVerification)
            if (!userVerification){   // if user input does not match DB entry
                console.log('hi')
                res.render('fail.ejs')
            }
            else{
                let token = jwt.sign({name: req.body.name, role: await db.getUserRole(req.body.userId)}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1h"})  // Send JWT to user via HTTP response
                res.cookie('token', token, {httpOnly: true}).status(200).redirect("/granted")
                
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

app.listen(3000)