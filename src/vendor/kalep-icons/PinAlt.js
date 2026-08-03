import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgPinAlt({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M19 9C19 5.1 15.9 2 12 2C8.1 2 5 5.1 5 9C5 12.5 7.6 15.4 11 15.9V22C11 22.6 11.4 23 12 23C12.6 23 13 22.6 13 22V15.9C16.4 15.4 19 12.5 19 9ZM12 5C11.4 5 11 5.4 11 6C11 6.6 11.4 7 12 7C13.1 7 14 7.9 14 9C14 9.6 14.4 10 15 10C15.6 10 16 9.6 16 9C16 6.8 14.2 5 12 5Z", fill: "currentColor" })));
}
export default SvgPinAlt;
