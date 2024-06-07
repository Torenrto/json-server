const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');

server.use(middlewares);
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Custom login route
server.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = router.db.get('users').value();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.status(200).json({ message: "Login successful", user });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
});

// Custom logout route
server.post('/logout', (req, res) => {
    // You can add custom logout logic here if needed
    res.status(200).json({ message: "Logout successful" });
});

// Custom profile route
server.get('/profile', (req, res) => {
    const user = router.db.get('users').find({ id: 1 }).value();
    res.status(200).json(user);
});

server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});