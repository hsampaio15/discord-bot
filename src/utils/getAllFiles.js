const fs = require("fs");
const path = require("path");

/**
 *
 * @param {*} directory where we want to get all the files and folders from
 * @param {*} foldersOnly if true, only return folders from a specific path
 */
module.exports = (directory, foldersOnly = false) => {
  let fileNames = [];

  // read ONLY files
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(directory, file.name);

    // check if the file in the loop is a folder
    if (foldersOnly) {
      if (file.isDirectory()) {
        fileNames.push(filePath);
      }
    } else {
      if (file.isFile()) {
        fileNames.push(filePath);
      }
    }
  }

  return fileNames;
};
