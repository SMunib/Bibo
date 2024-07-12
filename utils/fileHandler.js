const fs = require('fs');

module.exports = (file) => {
    const path = `uploads/${Date.now() + file.originalname}`;
    fs.writeFileSync(path, file.buffer);
    return path;
};