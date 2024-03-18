const express = require("express")
const screeningsController = require("./controllers/controllers")

const router = express.Router()

router.get("/screenings", screeningsController.screenings)

router.post("/postScreening", screeningsController.postScreening)

router.get("/deleteScreening/:screeningID", screeningsController.deleteScreening)

router.get("/movies", screeningsController.movies)

router.get("/deleteMovie/:movieID", screeningsController.deleteMovie)

router.post("/postMovies", screeningsController.postMovies)

router.get("/updateMovie/:movieID", screeningsController.updateMovie)

router.post("/updateMovie", screeningsController.updateMovieExecute)

router.get("/screens", screeningsController.screens)

router.post("/postScreen", screeningsController.postScreen)

router.get("/deleteScreen/:screenID", screeningsController.deleteScreen)

router.get("/updateScreen/:screenID", screeningsController.updateScreen)

router.post("/updateScreenExec", screeningsController.updateScreenExec)

router.get("/logout", (req, res) => res.render("logout"));

module.exports = router