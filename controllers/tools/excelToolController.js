import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Store session data in memory (in production, use Redis or Database)
const sessionData = {};

export const uploadExcel = (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'Vui lòng chọn file Excel'
			});
		}

		const userId = req.userId;
		const workbook = XLSX.readFile(req.file.path);
		
		// Store workbook info in session, but preserve any existing session data (scores etc.)
		if (!sessionData[userId]) sessionData[userId] = {};
		sessionData[userId].workbook = workbook;
		sessionData[userId].sheetNames = workbook.SheetNames;
		sessionData[userId].uploadedAt = new Date();

		// Delete temp file
		fs.unlinkSync(req.file.path);

		return res.json({
			success: true,
			message: 'File đã được tải thành công',
			sheets: workbook.SheetNames
		});
	} catch (error) {
		console.error('[excelToolController] uploadExcel error:', error);
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}
		return res.status(500).json({
			success: false,
			message: 'Lỗi khi xử lý file: ' + error.message
		});
	}
};

export const applySheet = (req, res) => {
	try {
		const userId = req.userId;

		if (!sessionData[userId] || !sessionData[userId].workbook) {
			return res.status(400).json({
				success: false,
				message: 'Vui lòng upload file trước'
			});
		}

		const workbook = sessionData[userId].workbook;
		const sheetNames = workbook.SheetNames;

		if (sheetNames.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'File không có sheet nào'
			});
		}

		// Process all sheets except the last one
		const sheetsToProcess = sheetNames.slice(0, -1);
		const peopleMap = new Map(); // Use Map to maintain order and avoid duplicates
		const originalOrder = [];

		for (let sheetIndex = 0; sheetIndex < sheetsToProcess.length; sheetIndex++) {
			const sheetName = sheetsToProcess[sheetIndex];
			const worksheet = workbook.Sheets[sheetName];
			if (!worksheet) continue;

			const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Get raw data

			// Determine start row based on sheet index
			// Sheet 1 (index 0): start from row 21 (index 20)
			// Other sheets: start from row 20 (index 19)
			const startRowIndex = sheetIndex === 0 ? 20 : 19;

			// Process from determined start row onwards
			for (let i = startRowIndex; i < jsonData.length; i++) {
				const row = jsonData[i];
				if (!row || row.length < 15) continue; // Need at least column P (14)

				// Column B is index 0 (sequence number)
				// Column I is index 7 (student ID)
				// Column K is index 9 (last name), Column M is index 11 (first name)
				// Column P is index 14 (date of birth)
				const sequenceNum = row[0]; // Column B
				const studentId = row[7]; // Column I
				const lastName = row[9]; // Column K
				const firstName = row[11]; // Column M
				const dateOfBirth = row[14]; // Column P

				// Check if sequence number exists AND student ID has numbers (indicates valid data row)
				if (sequenceNum && studentId && /\d/.test(studentId.toString()) && (lastName || firstName)) {
					const lastNameStr = lastName ? lastName.toString().trim() : '';
					const firstNameStr = firstName ? firstName.toString().trim() : '';
					const fullName = `${lastNameStr} ${firstNameStr}`.trim();
					const studentIdStr = studentId.toString().trim();
					const dobStr = dateOfBirth ? dateOfBirth.toString().trim() : '';

					if (fullName && !peopleMap.has(fullName)) {
						peopleMap.set(fullName, true);
						originalOrder.push({
							name: fullName,
							sequenceNum: sequenceNum,
							studentId: studentIdStr,
							dateOfBirth: dobStr
						});
					}
				}
			}
		}

		const people = originalOrder;

		if (people.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Không tìm thấy dữ liệu nào (cần có mã sinh viên ở cột I)'
			});
		}

		// Store sheet data but preserve any existing scores (do not reset)
		sessionData[userId].people = people;
		sessionData[userId].peopleOrder = people; // Store original order with sequence numbers

		return res.json({
			success: true,
			message: `Đã tải ${people.length} người từ tất cả sheet`,
			people: people,
			count: people.length
		});
	} catch (error) {
		console.error('[excelToolController] applySheet error:', error);
		return res.status(500).json({
			success: false,
			message: 'Lỗi khi xử lý sheet: ' + error.message
		});
	}
};

export const saveScore = (req, res) => {
	try {
		const { person, score1, score2 } = req.body;
		const userId = req.userId;

		// Ensure session storage exists for this user so scores can be saved before importing a sheet
		if (!sessionData[userId]) sessionData[userId] = {};
		if (!sessionData[userId].scores) sessionData[userId].scores = [];

		if (!person) {
			return res.status(400).json({
				success: false,
				message: 'Vui lòng chọn một người'
			});
		}

		// Check if at least one score is provided
		if (!score1 && !score2) {
			return res.status(400).json({
				success: false,
				message: 'Vui lòng nhập ít nhất một điểm'
			});
		}

		// Validate scores if provided
		if ((score1 && isNaN(score1)) || (score2 && isNaN(score2))) {
			return res.status(400).json({
				success: false,
				message: 'Điểm không hợp lệ'
			});
		}


		// Try to enrich with imported person data if available
		let sequenceNum = null;
		let studentId = null;
		let dateOfBirth = null;
		if (sessionData[userId].people && Array.isArray(sessionData[userId].people)) {
			const peopleList = sessionData[userId].people;
			const personData = peopleList.find(p => p.name === person);
			if (personData) {
				sequenceNum = personData.sequenceNum;
				studentId = personData.studentId;
				dateOfBirth = personData.dateOfBirth;
			}
		}

		// Check if person already exists, update if yes
		const existingIndex = sessionData[userId].scores.findIndex(
			item => item.person === person
		);

		const newEntry = {
			person,
			sequenceNum,
			studentId,
			dateOfBirth,
			score1: score1 ? parseFloat(score1) : null,
			score2: score2 ? parseFloat(score2) : null
		};

		if (existingIndex >= 0) {
			sessionData[userId].scores[existingIndex] = newEntry;
		} else {
			sessionData[userId].scores.push(newEntry);
		}

		return res.json({
			success: true,
			message: `Đã lưu điểm cho ${person}`,
			scores: sessionData[userId].scores
		});
	} catch (error) {
		console.error('[excelToolController] saveScore error:', error);
		return res.status(500).json({
			success: false,
			message: 'Lỗi khi lưu điểm: ' + error.message
		});
	}
};

export const getScores = (req, res) => {
	try {
		const userId = req.userId;

		if (!sessionData[userId]) {
			return res.json({
				success: true,
				scores: []
			});
		}

		return res.json({
			success: true,
			scores: sessionData[userId].scores || []
		});
	} catch (error) {
		console.error('[excelToolController] getScores error:', error);
		return res.status(500).json({
			success: false,
			message: 'Lỗi khi lấy dữ liệu: ' + error.message
		});
	}
};

export const deleteScore = (req, res) => {
	try {
		const { index } = req.body;
		const userId = req.userId;

		if (!sessionData[userId] || !sessionData[userId].scores) {
			return res.status(400).json({
				success: false,
				message: 'Không có dữ liệu để xóa'
			});
		}

		if (index < 0 || index >= sessionData[userId].scores.length) {
			return res.status(400).json({
				success: false,
				message: 'Dữ liệu không hợp lệ'
			});
		}

		const deletedItem = sessionData[userId].scores.splice(index, 1);

		return res.json({
			success: true,
			message: `Đã xóa dữ liệu của ${deletedItem[0].person}`,
			scores: sessionData[userId].scores
		});
	} catch (error) {
		console.error('[excelToolController] deleteScore error:', error);
		return res.status(500).json({
			success: false,
			message: 'Lỗi khi xóa dữ liệu: ' + error.message
		});
	}
};

export const clearScores = (req, res) => {
	try {
		const userId = req.userId;

		if (!sessionData[userId] || !sessionData[userId].scores) {
			// nothing to clear
			return res.json({
				success: true,
				message: 'Không có dữ liệu để xóa',
				scores: []
			});
		}

		sessionData[userId].scores = [];

		return res.json({
			success: true,
			message: 'Đã xóa tất cả dữ liệu',
			scores: []
		});
	} catch (error) {
		console.error('[excelToolController] clearScores error:', error);
		return res.status(500).json({
			success: false,
			message: 'Lỗi khi xóa tất cả dữ liệu: ' + error.message
		});
	}
};

export const exportScores = (req, res) => {
	try {
		const userId = req.userId;

		if (!sessionData[userId] || !sessionData[userId].scores || sessionData[userId].scores.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Không có dữ liệu để xuất'
			});
		}

		// Sort scores according to original order from file (by sequence number)
		const sortedScores = [...sessionData[userId].scores].sort((a, b) => {
			const seqA = typeof a.sequenceNum === 'string' ? parseInt(a.sequenceNum) : a.sequenceNum;
			const seqB = typeof b.sequenceNum === 'string' ? parseInt(b.sequenceNum) : b.sequenceNum;
			return seqA - seqB;
		});

		// Create workbook
		const ws_data = [
			['STT', 'Tên', 'Điểm 1', 'Điểm 2']
		];

		sortedScores.forEach(item => {
			ws_data.push([item.sequenceNum, item.person, item.score1, item.score2]);
		});

		const ws = XLSX.utils.aoa_to_sheet(ws_data);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Scores');

		// Set column widths
		ws['!cols'] = [
			{ wch: 10 },
			{ wch: 30 },
			{ wch: 15 },
			{ wch: 15 }
		];

		// Generate file and send
		const fileName = `scores_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
		const filePath = path.join(__dirname, '../../temp', fileName);

		// Create temp directory if not exists
		const tempDir = path.join(__dirname, '../../temp');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		XLSX.writeFile(wb, filePath);

		// Send file
		res.download(filePath, fileName, (err) => {
			if (err) {
				console.error('[excelToolController] Download error:', err);
			}
			// Delete temp file
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		});
	} catch (error) {
		console.error('[excelToolController] exportScores error:', error);
		return res.status(500).json({
			success: false,
			message: 'Lỗi khi xuất file: ' + error.message
		});
	}
};

export const getPeople = (req, res) => {
	try {
		const userId = req.userId;

		if (!sessionData[userId] || !sessionData[userId].people) {
			return res.json({
				success: true,
				people: []
			});
		}

		return res.json({
			success: true,
			people: sessionData[userId].people || []
		});
	} catch (error) {
		console.error('[excelToolController] getPeople error:', error);
		return res.status(500).json({
			success: false,
			message: 'Lỗi khi lấy danh sách: ' + error.message
		});
	}
};
