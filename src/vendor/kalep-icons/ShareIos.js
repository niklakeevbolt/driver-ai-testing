import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgShareIos({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M13 8V2.99903L14.8284 4.82688C15.219 5.21728 15.8521 5.21728 16.2427 4.82688C16.6332 4.43649 16.6332 3.80352 16.2427 3.41312L13.4142 0.585599C12.6332 -0.195201 11.3668 -0.195199 10.5858 0.585599L7.75737 3.41312C7.36685 3.80352 7.36685 4.43649 7.75737 4.82689C8.1479 5.21729 8.78106 5.21729 9.17158 4.82688L11 2.99905V8H5C3.89543 8 3 8.89543 3 10V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V10C21 8.89543 20.1046 8 19 8H13ZM13 8.00192H11V15.0019C11 15.554 11.4477 16.0016 12 16.0016C12.5523 16.0016 13 15.554 13 15.0019V8.00192Z", fill: "currentColor" })));
}
export default SvgShareIos;
