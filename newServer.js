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

function authenticateToken(req,rest,next){
    if(currentKey == ""){
        res.redirect("/identify")
    } else if(jwt.verify(currentKey, process.env.ACCESS_TOKEN_SECRET)){
        next()
    } else{
        res.redirect("/identify")
    }
}

app.get('/', (req,res) => {
    res.redirect('/identify')
})

app.post('/identify', async (req, res) => {

    if(req.body.name !== "" && req.body.password !== "" && !!(await db.userExists(req.body.userId))){
        try{       
            const username = req.body.userId    
            let token = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET)  // Send JWT to user via HTTP response
            let currentPassword = await bcrypt.hash(req.body.password,10)
            let val = await db.verifyUser(req.body.name, currentPassword)
            
            if (Object.keys(val).length == 0 && !(await bcrypt.compare(currentPassword, val.password))){
                res.render('fail.ejs')
            }
            else if(tokenArray.indexOf(token) === -1){
                currentKey = token
                res.redirect("/granted")
                tokenArray.push(token)
                console.log("JWT: "+ token)
            }
            else{
                res.render('fail.ejs', {alreadyLoggedIn: true}) // TODO: Get username from token and redirect to appropriate view
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