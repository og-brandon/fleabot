const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  defaultMeta: { service: "fleabot" },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

module.exports = {
  logger,
};
