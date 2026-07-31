import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgPlus(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, props),
        React.createElement("path", { d: "M13 5.00002C13 4.44773 12.5523 4 12 4C11.4477 4 11 4.44773 11 5.00002V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5.00002Z", fill: "currentColor" })));
}
export default SvgPlus;
