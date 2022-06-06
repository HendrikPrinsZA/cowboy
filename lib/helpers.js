const fs = require('fs');
const path = require('path');

module.exports = {

  /**
   * Prevent the confusion of all the different response handlers
   * 
   * Future idea:
   * - Sign the package with an identifier
   */
  convertResponse(response) {
    if (response === null) {
      return response;
    }

    if (Buffer.isBuffer(response)) {
      response = response.toString();
    }

    try {
      response = JSON.parse(response);
    } catch (error) {
      return response;
    }

    try {
      response = JSON.stringify(response);
    } catch (error) {
      console.log('Error: Failed to stringify!');
      console.log({
        response, 
        error
      });
      process.exit(1)
    }

    return response;
  },

  getHomePath() {
    return process.env.HOME || process.env.USERPROFILE;
  },

  getCowboyPath() {
    const baseName = path.basename(__dirname);
    return fs.realpathSync(__dirname.replace(`/${baseName}`, ''));
  },

  getStoragePath() {
    const baseName = path.basename(__dirname);
    return fs.realpathSync(__dirname.replace(`/${baseName}`, '/storage'));
  },
  
  hrtimeToMs(hrtime_parts) {
    return (parseInt(hrtime_parts[0]) * 1000000 + parseInt(hrtime_parts[1]) / 1000);
  },

  elapsedSinceMs(hrtime_parts) {
    const hrtime = process.hrtime(hrtime_parts);
    return (parseInt(hrtime[0]) * 1000000 + parseInt(hrtime[1]) / 1000);
  },

  hrtimeToStr(hrtime_parts) {
    return `${hrtime_parts[0]}.${hrtime_parts[1]}`;
  },

  strToHrtime(str) {
    hrtime_parts = str.split('.');
    return [
      parseInt(hrtime_parts[0]),
      parseInt(hrtime_parts[1])
    ];
  }

};
