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
  
};
