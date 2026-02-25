const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const apiKeyService = require('../services/apiKeyService');

function requireAdmin(req, res, next){
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
  next();
}

router.use(auth);
router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const list = await apiKeyService.listApiKeys();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const reveal = req.query.reveal === 'true';
    const item = await apiKeyService.getApiKey(req.params.id, { reveal });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, provider, key, isActive, notes } = req.body;
    if (!name || !provider || !key) return res.status(400).json({ message: 'name, provider and key are required' });
    const doc = await apiKeyService.createApiKey({ name, provider, key, isActive, createdBy: req.user._id, notes });
    const out = doc.toObject();
    delete out.key;
    res.status(201).json(out);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const patch = req.body;
    const doc = await apiKeyService.updateApiKey(req.params.id, patch);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const out = doc.toObject(); delete out.key;
    res.json(out);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await apiKeyService.deleteApiKey(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/validate', async (req, res) => {
  try {
    const result = await apiKeyService.validateKey(req.params.id);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
