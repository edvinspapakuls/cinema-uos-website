const db = require("../database");

exports.screenings = (req, res) => {
    Promise.all([
        db.execute("SELECT * FROM screenings"),
        db.execute("SELECT * FROM movies"),
        db.execute("SELECT * FROM screen")
    ])
    .then(([screeningsResult, moviesResult, screensResult]) => {
        const screenings = screeningsResult[0];
        const movies = moviesResult[0];
        console.log(movies);
        const screens = screensResult[0];
        res.render("screenings", { screenings, movies, screens });
    })
    .catch(err => console.log(err));
}

exports.postScreening = async (req, res) => {
    const { movieID, screenID, date, startTime } = req.body;
    console.log(req.body);

    try {
        // Fetch movie details
        const [movieRows] = await db.execute("SELECT title, duration FROM movies WHERE movieID=?", [movieID]);
        if (movieRows.length === 0) throw new Error('Movie not found');
        const movieName = movieRows[0].title;
        const movieDuration = movieRows[0].duration;

        // Update screen status
        await db.execute("UPDATE screen SET occupied = 'YES' WHERE screenID = ?", [screenID]);

        // Fetch screen capacity
        const [screenRows] = await db.execute("SELECT capacity FROM screen WHERE screenID=?", [screenID]);
        if (screenRows.length === 0) throw new Error('Screen not found');
        const tickets = screenRows[0].capacity;

                // Function to add minutes to time string
        function addMinutesToTimeString(timeStr, minsToAdd) {
            const [hours, minutes] = timeStr.split(":").map(Number); // Split the time string into hours and minutes and convert to numbers
            const time = new Date(); // Create a new date object
            time.setHours(hours, minutes + minsToAdd, 0, 0); // Set the time adding the minutes

            // Convert back to time string format
            const newHours = String(time.getHours()).padStart(2, '0');
            const newMinutes = String(time.getMinutes()).padStart(2, '0');
            return `${newHours}:${newMinutes}`; // Return the new time string
        }

        // Calculate the end time
        const movieEndTime = addMinutesToTimeString(startTime, movieDuration);

        // Insert new screening
        await db.execute(
            "INSERT INTO screenings (movieName, screenID, date, startTime, endTime, ticketsLeft) VALUES (?, ?, ?, ?, ?, ?)",
            [movieName, screenID, date, startTime, movieEndTime, tickets]
        );

        // Redirect or respond after successful insert
        res.redirect("/screenings");
    } catch (err) {
        console.log(err);
        // Respond with error
        res.status(500).send("Server Error");
    }
};

exports.deleteScreening = async (req, res) => {
    try {

        const screeningID = req.params.screeningID;

        // Fetch screenID
        const [screenRows] = await db.execute("SELECT screenID FROM screenings WHERE screeningID=?", [screeningID]);
        if (screenRows.length === 0) throw new Error('Screening not found');
        const screenID = screenRows[0].screenID;

        // Update screen status
        await db.execute("UPDATE screen SET occupied = 'NO' WHERE screenID = ?", [screenID]);

        // Delete screening
        await db.execute("DELETE FROM screenings WHERE screeningID=?", [screeningID]);

        res.redirect("/screenings");
    } catch (err) {
        console.log(err);
    }
}

exports.movies = (req, res) => {
    db.execute("SELECT * FROM movies")
        .then(([rows, fields]) => {
            res.render("movies", { movies: rows });
        })
        .catch(err => console.log(err));
};

exports.postMovies = (req, res) => {

    const title = req.body.title
    const releaseDate = req.body.releaseDate
    const duration = req.body.duration
    const genre = req.body.genre
    const director = req.body.director
    const language = req.body.language
    const rating = req.body.rating
    const synopsis = req.body.synopsis

    if (title === "" || releaseDate === "" || duration === "" || genre === "" || director === "" || language === "" || rating === "" || synopsis === "") {
        return res.render("wrong");
    }

    db.execute("INSERT INTO movies (title, releaseDate, duration, genre, director, language, rating, synopsis) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [title, releaseDate, duration, genre, director, language, rating, synopsis])
        .then(() => {
            res.redirect("/movies")
        })
        .catch(err => console.log(err))
}

exports.deleteMovie = (req, res) => {
    db.execute("DELETE FROM movies WHERE movieID=?", [req.params.movieID])
        .then(([rows, fields]) => {
            res.redirect("/movies");
        })
        .catch(err => console.log(err));
};

exports.updateMovie = (req, res) => {
    db.execute("SELECT * FROM movies WHERE movieID=?", [req.params.movieID])
        .then(([rows, fields]) => {
            res.render("updateMovie", { movie: rows[0] });
        })
        .catch(err => console.log(err));
}

exports.updateMovieExecute = (req, res) => {
    console.log('Request body:', req.body);
    const { movieID, title, releaseDate, duration, genre, director, language, synopsis } = req.body;
    const query = "UPDATE movies SET title=?, releaseDate=?, duration=?, genre=?, director=?, language=?, synopsis=? WHERE movieID=?";
    const params = [title, releaseDate, duration, genre, director, language, synopsis, movieID];
    console.log('Executing query:', query, 'with parameters:', params);
    db.execute(query, params)
        .then(() => {
            console.log('Update successful, redirecting...');
            res.redirect("/movies");
        })
        .catch(err => console.error('Error executing query:', err));
};

exports.screens = (req, res) => {
    db.execute("SELECT * FROM screen")
        .then(([rows, fields]) => {
            res.render("screens", {screens: rows})
        })
        .catch(err => console.log(err))
}

exports.postScreen = (req, res) => {

    const capacity = req.body.capacity

    db.execute("INSERT INTO screen (capacity) VALUES (?)",
        [capacity])
        .then(() => {
            res.redirect("/screens")
        })
        .catch(err => console.log(err))
}

exports.deleteScreen = (req, res) => {
    db.execute("DELETE FROM screen WHERE screenID=?", [req.params.screenID])
        .then(([rows, fields]) => {
            res.redirect("/screens");
        })
        .catch(err => console.log(err));
};

exports.updateScreen = (req, res) => {
    db.execute("SELECT * FROM screen WHERE screenID=?", [req.params.screenID])
        .then(([rows, fields]) => {
            res.render("updateScreen", { screen: rows[0] });
        })
        .catch(err => console.log(err));
}

exports.updateScreenExec = (req, res) => {
    const { screenID, capacity } = req.body;
    const query = "UPDATE screen SET capacity=? WHERE screenID=?";
    const params = [capacity, screenID];
    db.execute(query, params)
        .then(() => {
            console.log('Update successful, redirecting...');
            res.redirect("/screens");
        })
        .catch(err => console.error('Error executing query:', err));
};