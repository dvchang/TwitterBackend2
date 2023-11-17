import { Router } from "express";

const router = Router();

router.post('/', (req, res) => {
    res.status(501).json({ error: 'Not implemnted :p' });
});

router.get('/:id', (req, res) => {
    const {id} = req.params;
    res.status(501).json({ error:`Not implemnted :p ${id}` });
});

router.delete('/:id', (req, res) => {
    const {id} = req.params;
    res.status(501).json({ error:`Not implemnted :p ${id}` });
});

export default router;
