const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.json())

var currentKey = ""
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
    const username = req.body.userId
    const token = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET)
    currentKey = token
    currentPassword = await bcrypt.hash(req.body.password,10)
    res.redirect("/granted")
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