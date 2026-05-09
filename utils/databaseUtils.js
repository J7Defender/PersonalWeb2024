// Database utilities are stubbed because the online database is disabled.

const getEmail = (accessToken) => {
  // Token decoding is disabled in offline mode
  return null;
};

const getId = (accessToken) => {
  return null;
};

const getUserByToken = async (accessToken) => {
  return null;
};

const getUserById = async (userId) => {
  return null;
};

const getUserWithNotes = async (userId) => {
  return null;
};

const getNoteById = async (userObj, noteId) => {
  return null;
};

export {
  getEmail,
  getId,
  getUserByToken,
  getUserById,
  getUserWithNotes,
  getNoteById,
};
