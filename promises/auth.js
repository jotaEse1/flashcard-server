const {connection} = require("../db")

const createUser = (sql, email, password, username) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, [username, email, password, "empty"], (err, newUser) => {
            if(err) return reject(err)
            resolve(newUser)
        })
    })
}

const findUser = (sql, credential) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, [credential], (err, user) => {
            if(err) return reject(err)
            resolve(user)
        })
    })
}

const saveToken = (sql, refreshToken, id) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, [refreshToken, id], (err, logged) => {
            if(err) return reject(err)
            resolve(logged)
        })
    })
}

const updateUser = (sql, credential, id) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, [credential, id], (err, res) => {
            if(err) return reject(err)
            resolve(res)
        })
    })
}


module.exports = {
    createUser,
    findUser,
    saveToken,
    updateUser
}