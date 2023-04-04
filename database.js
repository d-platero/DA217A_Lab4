const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')
const bcrypt = require('bcrypt')


db.serialize(async () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (userID TEXT PRIMARY KEY, role TEXT, name TEXT, password TEXT)`)

  let input = [[`id1`, `user1`, `student`, `password`], 
  [`id2`, `user2`, `student`, `password2`], 
  [`id3`, `user3`, `teacher`, `password3`],
  [`admin`, `admin`, `admin`, `admin`]]
  
  // Inserts the above initial credentials into the DB on server startups
  registerUser(input[0][0], input[0][1], input[0][2], input[0][3])
  registerUser(input[1][0], input[1][1], input[1][2], input[1][3])
  registerUser(input[2][0], input[2][1], input[2][2], input[2][3])
  registerUser(input[3][0], input[3][1], input[3][2], input[3][3])
})

/*- User1, userID: id1, name: user1, role: student and password: password
- User2, userID: id2, name: user2, role: student and password: password2
- User3, userID: id3, name: user3, role: teacher and password: password3
- Admin, userID: admin, name: admin, role: admin and password: admin */

module.exports = { db, verifyUser, userExists, registerUser };


async function verifyUser(userId, password){
    return new Promise((resolve, reject) => {
    let stmt = db.prepare(`SELECT users.password FROM users WHERE (?)=users.userID AND (?)=users.password`)
    stmt.get([userId, password], (err, row) => {
        resolve(row)
    })
    stmt.finalize()
})
}

async function userExists(userName){
    return new Promise((resolve, reject) => {
        let stmt = db.prepare(`SELECT users.name FROM users WHERE (?)=users.name`)
        stmt.get(userName, (err, row) => {
            resolve(row)
        })
        stmt.finalize()
    })
}

async function registerUser(userID, role, userName, password){
    return new Promise((resolve, reject) =>{
        let stmt = db.prepare(`INSERT INTO users(userID, role, name, password) VALUES ((?), (?), (?), (?))`)
        stmt.run([userID,role,userName,password], (err, row) => {
            resolve(row)
        })
        stmt.finalize()
    })
}

async function getUserRole(userName){
    return new Promise((resolve, reject) => {
        let stmt = db.prepare(`SELECT users.role FROM users WHERE (?)=users.name`)
        stmt.get(userName, (err, row) => {
            resolve(row)
        })
        stmt.finalize()
    })
}