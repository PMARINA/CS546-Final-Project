const express = require('express');
const router = new express.Router();
const Building = require('../../data/Building');
const BuildingModel = require('../../models/building.js');
const UserModel = require('../../models/user.js');
const middleware = require('../middleware');
const scripts = [{ script: '/js/building/social.js' }];

router.use(middleware.auth.loggedInOnly);

// router.get("/", async (req, res) => {
//   res.json("all buildings");
// });

router.get('/:id', async (req, res) => {
	const buildingInfo = await BuildingModel.findOne({
		_id: req.params.id
	}).lean();
	res.render('building', {
		name: buildingInfo.name,
		comments: buildingInfo.comments,
		scripts: scripts
	});
	return;
});

router.post('/:id', async (req, res) => {
	const buildingInfo = await BuildingModel.findOne({
		_id: req.params.id
	}).lean();
	try {
		const addedComment = await Building.comment(
			req.params.id.toString(),
			req.body.commentVal,
			res.locals.userInfo._id.toString()
		);
	} catch (e) {
		console.log(e);
	}
	res.render('building', {
		name: buildingInfo.name,
		comments: buildingInfo.comments,
		scripts: scripts
	});
});

router.get('/listOfAccessGroups', async (req, res) => {
	try {
		const accessGroups = await Building.getAllAccessGroups();
	} catch (e) {
		console.log(e);
		res.json(e);
		return;
	}

	res.json(accessGroups);
});

router.delete('/:id', async (req, res) => {
	const buildingId = req.params.id;
	res.json(`deleted the building with id: ${buildingId}`);
});

router.patch('/:id', async (req, res) => {
	const buildingId = req.params.id;
	res.json(`updated the building with id: ${buildingId}`);
});

module.exports = router;
