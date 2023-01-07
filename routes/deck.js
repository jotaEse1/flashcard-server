const express = require("express")
const router = express.Router()
const {
    createDeck,
    getDecks,
    uploadDeck,
    deleteDeck,
    addWord,
    deleteWord,
    updateWord,
    renameDeck,
} = require("../controllers/deck")

router.route("/create").post(createDeck)
router.route("/getDecks").get(getDecks)
router.route("/delete").delete(deleteDeck)
router.route("/upload").post(uploadDeck)
router.route("/rename").put(renameDeck)

router.route("/addWord").post(addWord)
router.route("/updateWord").put(updateWord)
router.route("/deleteWord").delete(deleteWord)

module.exports = router;