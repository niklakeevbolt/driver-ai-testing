import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgArrowForward(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "data-rtl-mirror": true }, props),
        React.createElement("path", { d: "M13.7108 18.2889C13.3202 18.6795 13.3202 19.3126 13.7108 19.7032C14.1013 20.0937 14.7345 20.0937 15.125 19.7032L21.4142 13.4141C22.1952 12.6331 22.1952 11.3668 21.4142 10.5857L15.1212 4.29289C14.7307 3.90237 14.0975 3.90237 13.707 4.29289C13.3165 4.68342 13.3165 5.31658 13.707 5.70711L19 10.9999L2.99753 10.9999C2.44524 10.9999 1.99753 11.4477 1.99753 11.9999C1.99753 12.5522 2.44524 13 2.99753 13L19 12.9999L13.7108 18.2889Z", fill: "currentColor" })));
}
export default SvgArrowForward;
