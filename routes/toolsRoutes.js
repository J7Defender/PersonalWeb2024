import express from "express";
import multer from "multer";
import {
	uploadExcel,
	applySheet,
	saveScore,
	getScores,
	deleteScore,
	clearScores,
	exportScores,
	getPeople
} from "../controllers/tools/excelToolController.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
	dest: 'temp/',
	fileFilter: (req, file, cb) => {
		if (!file.originalname.match(/\.(xlsx|xls)$/)) {
			return cb(new Error('Only Excel files are allowed'));
		}
		cb(null, true);
	},
	limits: {
		fileSize: 10 * 1024 * 1024 // 10MB
	}
});

router.get("/tools", (req, res) => {
	if (req.authenticateSuccess === false) {
		console.log("[toolsRoutes.js] User not authenticated");
		return res.redirect("/");
	}

	return res.render("tools", {
		title: "Tools",
		authenticated: true,
	});
});

router.post("/tools", (req, res) => {

});

router.get("/tools/excel", (req, res) => {
	if (req.authenticateSuccess === false) {
		console.log("[toolsRoutes.js] User not authenticated");
		return res.redirect("/");
	}
	return res.render("excelTool", {
		title: "Excel Tool",
		authenticated: true,
		userId: req.userId
	});
});

// Excel Tool API Routes
router.post("/api/excel/upload", upload.single('file'), uploadExcel);
router.post("/api/excel/apply-sheet", applySheet);
router.post("/api/excel/save-score", saveScore);
router.get("/api/excel/scores", getScores);
router.post("/api/excel/delete-score", deleteScore);
router.post("/api/excel/clear-scores", clearScores);
router.get("/api/excel/export", exportScores);
router.get("/api/excel/people", getPeople);

export default router;