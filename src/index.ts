import express from 'express'
import userRoutes from './routes/userRouters';
import tweetRoutes from './routes/tweetRoutes';
import authRoutes from './routes/authRoutes';
import { authenticationToken } from './middlewares/authMiddleware';

const app = express();
app.use(express.json());
app.use('/user', authenticationToken, userRoutes)
app.use('/tweet', authenticationToken, tweetRoutes)
app.use('/auth', authRoutes)

app.get('/', (req, res) => {
    res.send('Hello world updated.');
});


app.listen(3000, () => {
    console.log("Server ready at localhost:3000");
});

