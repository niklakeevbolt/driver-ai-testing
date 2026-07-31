import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgMap({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M7.33331 3.00146L3.36754 4.32339C2.55086 4.59562 2 5.35989 2 6.22075V19.8063C2 20.8301 3.00304 21.5531 3.97434 21.2293L7.33331 20.1097V3.00146Z", fill: "currentColor" }),
        React.createElement("path", { d: "M9.33331 19.6652L14.6666 21.443V4.33478L9.33331 2.55701V19.6652Z", fill: "currentColor" }),
        React.createElement("path", { d: "M20.6325 19.6766L16.6666 20.9985V3.89036L20.0257 2.77068C20.997 2.44692 22 3.16987 22 4.19371V17.7792C22 18.6401 21.4491 19.4044 20.6325 19.6766Z", fill: "currentColor" })));
}
export default SvgMap;
