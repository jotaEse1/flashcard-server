const {connection} = require("../db")

const newDeck = (sql, id, name, payload) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, [id, name, JSON.stringify(payload)], (err, res) => {
            if(err) reject(err)
            else resolve(res)
        })
    })
}

const saveDeck = (sql, field, idDeck) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, [field, idDeck], (err, result) => {
            if(err) reject(err)
            else resolve(result)
        })
    })
}

const findDecks = (sql, id) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, [id], (err, deck) => {
            if(err) reject(err)
            else resolve(deck)
        })
    })
}

const removeDeck = (sql, idDeck) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, [idDeck], (err, res) => {
            if(err) reject(err)
            else resolve(res)
        })
    })
}

module.exports = {
    newDeck,
    saveDeck,
    findDecks,
    removeDeck
}
