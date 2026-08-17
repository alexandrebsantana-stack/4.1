const express = require('express');
const controller = require('../controllers/controller');

const router = express.Router();

router.post('/chamados', controller.createChamado);
router.get('/chamados', controller.listChamados);
router.get('/chamados/:id', controller.getChamado);
router.put('/chamados/:id', controller.updateChamado);
router.delete('/chamados/:id', controller.deleteChamado);

module.exports = router;
