
process.env.NODE_ENV = 'production';

const express = require("express")
const bodyParser = require("body-parser")
const routes = require("./routes")
const path = require("path")
const cookieParser = require('cookie-parser');

const app = express()

app.set("view engine", "ejs")
app.set("views", "views")

app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")))

// Mock user for the sake of this example
const user = {
    username: 'admin',
    password: 'password' // In real-world scenarios, passwords should be hashed
};

// Combined authentication middleware
app.use((req, res, next) => {
    // Check if user is already logged in
    if (req.cookies.login === 'true') {
        return next(); // They're logged in, so let them proceed
    }

    // If they're trying to log in, check their credentials
    if (req.path === '/login' && req.method === 'POST') {
        const { username, password } = req.body;
        if (username === user.username && password === user.password) {
            // Correct credentials; log them in and set a cookie
            console.log('Correct credentials');
            res.cookie('login', 'true', { maxAge: 86400000, httpOnly: true });
            return res.redirect('/screenings');
        } else {
            // Incorrect credentials; prevent further access
            return res.render("wrong")
        }
    }

    // If they're not trying to log in and don't have a login cookie, deny access
    return res.render('login');
});

// Logout route
app.get('/logout', (req, res) => {
    // Clear the 'login' cookie by setting its expiration date to a time in the past
    res.cookie('login', '', { expires: new Date(0), path: '/' });
    res.redirect('/sceenings');
});

app.use(routes)

app.use((req, res) => {
    res.status(404).send("Page Not Found")
})

app.listen(8080)