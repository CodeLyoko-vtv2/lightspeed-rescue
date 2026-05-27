const React = require("react");
const { View } = require("react-native");

const WebMapView = React.forwardRef(({ children, style, ...props }, ref) => {
  React.useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
    animateCamera: () => {},
    fitToCoordinates: () => {},
  }));

  return React.createElement(
    View,
    {
      ...props,
      style: [
        { backgroundColor: "#dbe7e5", overflow: "hidden" },
        style,
      ],
    },
    children
  );
});

const EmptyMapChild = () => null;

module.exports = {
  __esModule: true,
  default: WebMapView,
  Marker: EmptyMapChild,
  Polyline: EmptyMapChild,
  Callout: EmptyMapChild,
  Circle: EmptyMapChild,
  PROVIDER_GOOGLE: "google",
};
