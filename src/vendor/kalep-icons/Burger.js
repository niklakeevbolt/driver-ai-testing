import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgBurger({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M3 6C3 5.44772 3.44772 5 4 5L20 5C20.5523 5 21 5.44772 21 6C21 6.55228 20.5523 7 20 7L4 7C3.44772 7 3 6.55228 3 6Z", fill: "currentColor" }),
        React.createElement("path", { d: "M3 12C3 11.4477 3.44772 11 4 11L20 11C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13L4 13C3.44772 13 3 12.5523 3 12Z", fill: "currentColor" }),
        React.createElement("path", { d: "M4 17C3.44772 17 3 17.4477 3 18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18C21 17.4477 20.5523 17 20 17H4Z", fill: "currentColor" })));
}
export default SvgBurger;
