const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';

server.use(middlewares);
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || email.length < 6 || !password || password.length < 6) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const users = router.db.get('users').value();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        const accessToken = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        const expiredAt = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour
        return res.status(200).json({ accessToken, expiredAt });
    } else {
        return res.status(401).json({ message: "Invalid email or password" });
    }
});

server.get('/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = router.db.get('users').find({ id: decoded.userId }).value();
        if (user) {
            const { email, password, ...profile } = user; // Exclude email and password from the profile
            return res.status(200).json(profile);
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
});

server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});