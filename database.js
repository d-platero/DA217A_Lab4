const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')
const bcrypt = require('bcrypt')


db.serialize(async () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (name TEXT, password TEXT)`)
})

module.exports = { db, verifyUser, registerUser, checkUser };

async function verifyUser(userName, password){
    let encryptedPwd = await bcrypt.hash(password,10)
    return new Promise((resolve, reject) => {
    let stmt = db.prepare(`SELECT users.password FROM users WHERE (?)=users.name AND (?)=users.password`)
    stmt.all([userName, password], (err, row) => {
        resolve(row)
    })
    stmt.finalize()
})
}

async function registerUser(userName, password){
    let encryptedPwd = await bcrypt.hash(password,10)
    return new Promise((resolve, reject) =>{
        let stmt = db.prepare(`INSERT INTO users(name, password) VALUES ((?), (?))`)
        stmt.run([userName,password], (err, row) => {
            resolve(row)
        })
        stmt.finalize()
    })
}

async function checkUser(userName){
    return new Promise((resolve, reject) => {
        let stmt = db.prepare(`SELECT users.name FROM users WHERE (?)=users.name`)
        stmt.all([userName], (err, row) => {
            resolve(row)
        })
        stmt.finalize()
    })
}