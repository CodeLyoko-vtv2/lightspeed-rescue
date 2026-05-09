"use strict";

const { logger } = require("firebase-functions");

const sendToVictim = async ({ victimId, sosId, title, body }) => {
  try {
    logger.info("sendToVictim not implemented", {
      victimId,
      sosId,
      title,
      body
    });

    return null;
  } catch (error) {
    logger.warn("sendToVictim failed", {
      victimId,
      sosId,
      error: error && error.message ? error.message : String(error)
    });
    return null;
  }
};

module.exports = {
  sendToVictim
};
