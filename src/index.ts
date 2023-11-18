import express from 'express'
import userRoutes from './routes/userRouters';
import tweetRoutes from './routes/tweetRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
app.use(express.json());
app.use('/user', userRoutes)
app.use('/tweet', tweetRoutes)
app.use('/auth', authRoutes)

app.get('/', (req, res) => {
    res.send('Hello world updated.');
});


app.listen(3000, () => {
    console.log("Server ready at localhost:3000");
});

