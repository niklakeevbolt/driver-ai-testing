import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgCard({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M4 4H20C21.1 4 22 4.9 22 6V8.07H2V6C2 4.9 2.9 4 4 4Z", fill: "currentColor" }),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M4 20C2.9 20 2 19.1 2 18V9.93H22V18C22 19.1 21.1 20 20 20H4ZM8 15H6C5.5 15 5 15.4 5 16C5 16.6 5.4 17 6 17H8C8.6 17 9 16.6 9 16C9 15.4 8.6 15 8 15Z", fill: "currentColor" })));
}
export default SvgCard;
