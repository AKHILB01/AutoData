// In-memory storage for extracted ID data
const idDataList = [];

const saveIdData = async (data) => {
  const entry = { id: Date.now(), ...data };
  idDataList.unshift(entry); // Add newest first
  return entry;
};

const getAllIdData = async () => {
  return idDataList;
};

module.exports = { saveIdData, getAllIdData };
