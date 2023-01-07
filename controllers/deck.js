const {
    findDecks, newDeck, saveDeck, removeDeck
} = require("../promises/deck");

const createDeck = async (req, res) => {
    const {name} = req.body, {idUser} = req.query;

    try {
        const sqlCreateDeck = "INSERT INTO deck(id_user, name, deck) VALUES(?,?,?)",
        payload = {
            cards: [],
            totalWords: 0,
            learningWords: 0,
            matureWords: 0
        },
        result = await newDeck(sqlCreateDeck, idUser, name, payload);

        res.json({
            success: true,
            payload: {
                status: 200,
                result
            }
        });

    } catch (error) {
        return res.json({
            success: false,
            payload: {
                error
            }
        });
    }
}

const getDecks = async (req, res) => {
    const {idUser} = req.query;

    try {
        const sqlFindDecks = "SELECT * FROM deck WHERE id_user = ?;";
            decks = await findDecks(sqlFindDecks, idUser);

        res.json({
            success: true,
            payload: {
                status: 200,
                decks
            }
        });
    } catch (error) {
        return res.json({
            success: false,
            payload: {
                error
            }
        });
    }
};

const uploadDeck = async (req, res) => {
    const {cards} = req.body, {idDeck} = req.query;

    try {
        const sqlFindDeck = "SELECT * FROM deck WHERE id = ?",
            {0: deck} = await findDecks(sqlFindDeck, idDeck),
            wordsAdded = cards.length;
        
        //parse
        deck.deck = JSON.parse(deck.deck)

        //add words
        const concatenedTotalCards = deck.deck.cards.concat(cards)
        deck.deck.cards = concatenedTotalCards
        deck.deck.totalWords += wordsAdded
        deck.deck.learningWords += wordsAdded

        //save deck
        const sqlSaveDeck = "UPDATE deck SET deck = ? WHERE id = ?",
            result = await saveDeck(sqlSaveDeck, JSON.stringify(deck.deck), idDeck)

        res.json({
            success: true,
            payload: {
                status: 200,
                result
            }
        });
        
    } catch (error) {
        return res.json({
            success: false,
            payload: {
                error
            }
        });
    }
};

const renameDeck = async (req, res) => {
    const {name} = req.body, {idDeck} = req.query

    try {
        const sqlFindDeck = "SELECT * FROM deck WHERE id = ?;",
            {0: deck} = await findDecks(sqlFindDeck, idDeck)

        deck.name = name

        const sqlChangeName = "UPDATE deck SET name = ? WHERE id = ?;",
            result = await saveDeck(sqlChangeName, name, idDeck)

        res.json({
            success: true,
            payload: {
                status: 200,
                result
            }
        });
    } catch (error) {
        return res.json({
            success: false,
            payload: {
                error
            }
        });
    }
}

const deleteDeck = async (req, res) => {
    const {idDeck} = req.query
    
    try {
        const sqlDeleteDeck = "DELETE FROM deck WHERE id = ?;",
            result = await removeDeck(sqlDeleteDeck, idDeck)

        res.json({
            success: true,
            payload: {
                status: 200,
                result
            }
        });

    } catch (error) {
        return res.json({
            success: false,
            payload: {
                error
            }
        });
    }
}

const addWord = async (req, res) => {
    const {card} = req.body, {idDeck} = req.query
    
    try {
        const sqlFindDeck = "SELECT * FROM deck WHERE id = ?",
            {0: deck} = await findDecks(sqlFindDeck, idDeck);
        
        //parse
        deck.deck = JSON.parse(deck.deck)

        //add word
        deck.deck.cards.push(card)
        deck.deck.totalWords++
        deck.deck.learningWords++

        //save deck
        const sqlSaveDeck = "UPDATE deck SET deck = ? WHERE id = ?",
            result = await saveDeck(sqlSaveDeck, JSON.stringify(deck.deck), idDeck)

        res.json({
            success: true,
            payload: {
                status: 200,
                result
            }
        });
    } catch (error) {
        return res.json({
            success: false,
            payload: {
                error
            }
        });
    }
}

const updateWord = async (req, res) => {
    const {editedWord} = req.body, {idDeck} = req.query;

    try {
        const sqlFindDeck = "SELECT * FROM deck WHERE id = ?",
            {0: deck} = await findDecks(sqlFindDeck, idDeck);
        
        //parse
        deck.deck = JSON.parse(deck.deck)

        for (let i = 0; i < deck.deck.cards.length; i++) {
            const card = deck.deck.cards[i];

            if(card.id !== editedWord.id) continue 
            
            card.targetWord = editedWord.word
            card.nativeWord = editedWord.translation
            break
        }

        const sqlSaveDeck = "UPDATE deck SET deck = ? WHERE id = ?;",
            result = await saveDeck(sqlSaveDeck, JSON.stringify(deck.deck), idDeck)

        res.json({
            success: true,
            payload: {
                status: 200,
                result
            }
        });

    } catch (error) {
        return res.json({
            success: false,
            payload: {
                error
            }
        });
    }
}

const deleteWord = async (req, res) => {
    const {id, idDeck} = req.query;

    try {
        const sqlFindDeck = "SELECT * FROM deck WHERE id = ?;",
            {0: deck} = await findDecks(sqlFindDeck, idDeck)

        //parse
        deck.deck = JSON.parse(deck.deck)

        for (let i = 0; i < deck.deck.cards.length; i++) {
            const card = deck.deck.cards[i];

            if(card.id !== id) continue 
            
            card.modality === "learning_words"? deck.deck.learningWords-- : deck.deck.matureWords-- 
            deck.deck.totalWords--
            deck.deck.cards.splice(i, 1)
            break
        }
        
        const sqlSaveDeck = "UPDATE deck SET deck = ? WHERE id = ?;",
            result = await saveDeck(sqlSaveDeck, JSON.stringify(deck.deck), idDeck)

        res.json({
            success: true,
            payload: {
                status: 200,
                result
            }
        });

    } catch (error) {
        return res.json({
            success: false,
            payload: {
                error
            }
        });
    }
}


module.exports = {
    createDeck,
    getDecks,
    uploadDeck,
    renameDeck,
    deleteDeck,
    addWord,
    updateWord,
    deleteWord,
};