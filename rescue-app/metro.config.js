const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    if (moduleName === "react-native-maps") {
      return {
        type: "sourceFile",
        filePath: path.resolve(__dirname, "shims/react-native-maps.web.js"),
      };
    }

    if (moduleName === "react-native-maps-directions") {
      return {
        type: "sourceFile",
        filePath: path.resolve(__dirname, "shims/react-native-maps-directions.web.js"),
      };
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
