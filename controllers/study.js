const { findDecks, saveDeck } = require("../promises/deck");

const updateWords = async (req, res) => {
    const {cards} = req.body, {idDeck} = req.query;

    try {
        const sqlFindDeck = "SELECT * FROM deck WHERE id = ?;",
            {0: deck} = await findDecks(sqlFindDeck, idDeck)

        //parse
        deck.deck = JSON.parse(deck.deck)

        for (let i = 0; i < deck.deck.cards.length; i++) {
            const card = deck.deck.cards[i];
            
            if(!cards[card.targetWord]) continue

            const updatedCard = cards[card.targetWord]

            if(card.modality === "learning_words" && updatedCard.modality === "mature_words"){
                deck.deck.learningWords--
                deck.deck.matureWords++
            }
            if(card.modality === "mature_words" && updatedCard.modality === "learning_words"){
                deck.deck.matureWords--
                deck.deck.learningWords++
            }

            card.points = updatedCard.points
            card.dayRepeatUnix = updatedCard.dayRepeatUnix
            card.dayRepeatStr = updatedCard.dayRepeatStr
            card.state = updatedCard.state
            card.modality = updatedCard.modality
        }

        const sqlSaveDeck = "UPDATE deck SET deck = ? WHERE id = ?;",
            result = await saveDeck(sqlSaveDeck, JSON.stringify(deck.deck), idDeck);

        res.json({
            success: true,
            payload: {
                status: 200,
                result
            }
        });

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            payload: {
                error
            }
        });
    }

}

module.exports = {
    updateWords
}
