const express = require("express")
const app = express()
app.set('view-engine', 'ejs')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const db = require('./database')
const tokenArray = []
require("dotenv").config()

app.use(express.urlencoded({extended:false}))
app.use(express.json())


app.get('/', (req, res) =>{
//    var token = jwt.sign("username", process.env.TOKEN)
    res.redirect('/LOGIN')
})

app.get('/LOGIN', (req,res) => {
    res.render('login.ejs',  {registered:req.query.registered})
})

app.post('/LOGIN', async (req, res) => {

    if(req.body.name !== "" && req.body.password !== "" && !(Object.keys(await db.checkUser(req.body.name)).length == 0)){
        try{
            let val = await db.verifyUser(req.body.name, req.body.password)
            var token = jwt.sign(req.body.name,process.env.TOKEN)
            if (Object.keys(val).length == 0 && !(await bcrypt.compare(req.body.password, val.password))){
                res.render('fail.ejs')
            }
            else if(tokenArray.indexOf(token) === -1){
               res.render('start.ejs')
               tokenArray.push(token)
               console.log("JWT: "+ token)
            }
            else{
                res.render('fail.ejs', {alreadyLoggedIn: true})
            }
        }
        catch (e){
            console.log("Error", e.stack)
            console.log("Error", e.name)
            console.log("Error", e.message)
        }
    }
    else{
        res.redirect('/LOGIN')
    }

})

app.get('/register', (req, res) => {
    res.render('register.ejs', {validPwd:req.query.validPwd, validUser:req.query.validUser})
})

app.post('/register', async (req, res) => {
    try {
        if(req.body.name !== "" && req.body.password !== "" && req.body.passwordConfirm !== ""){
            if (req.body.password !== req.body.passwordConfirm){
                res.redirect('/register?validPwd=false')
            }
            else
{            let val = await db.checkUser(req.body.name)
            
                if (typeof val !== "undefined" && Object.keys(val).length == 0){
                    await db.registerUser(req.body.name, req.body.password)
                    res.redirect('/LOGIN?registered=true')
                }
                else{
                    res.redirect('/register?validUser=false')
                }
}            }
        else{
            res.redirect('/register')
        }
            
    }
    catch (e){
        console.log("Error", e.stack)
        console.log("Error", e.name)
        console.log("Error", e.message)
    }
})
/*app.get('/anotherview', (req, res) =>
    res.render('view2.ejs'))
*/
app.listen(5000)
