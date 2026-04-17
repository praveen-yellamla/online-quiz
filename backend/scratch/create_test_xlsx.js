const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const data = [
  ["Question", "Type", "OptionA", "OptionB", "OptionC", "OptionD", "CorrectAnswer", "Points"],
  ["What is 2+2?", "MCQ", "3", "4", "5", "6", "4", "5"],
  ["Define Node.js", "SHORT", "", "", "", "", "JavaScript runtime", "10"]
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Questions");

const filePath = path.join(process.cwd(), 'test_questions.xlsx');
XLSX.writeFile(wb, filePath);
console.log('Test Excel file created at:', filePath);
