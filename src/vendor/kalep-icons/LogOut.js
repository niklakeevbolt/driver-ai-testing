import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgLogOut(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "data-rtl-mirror": true }, props),
        React.createElement("path", { d: "M4 4C4 2.89543 4.89514 2 5.99936 2H14.9965C16.1007 2 16.9958 2.89543 16.9958 4V6C16.9958 6.55228 16.5483 7 15.9962 7C15.4441 7 14.9965 6.55228 14.9965 6V4H5.99936V20H14.9965V18C14.9965 17.4477 15.4441 17 15.9962 17C16.5483 17 16.9958 17.4477 16.9958 18V20C16.9958 21.1046 16.1007 22 14.9965 22H5.99936C4.89514 22 4 21.1046 4 20V4Z", fill: "currentColor" }),
        React.createElement("path", { d: "M8.9984 12C8.9984 11.4477 9.44597 11 9.99808 11H21.0009L19.1731 9.17158C18.7827 8.78106 18.7827 8.14789 19.1731 7.75737C19.5635 7.36685 20.1965 7.36685 20.5869 7.75737L23.4144 10.5858C24.1952 11.3668 24.1952 12.6332 23.4144 13.4142L20.5869 16.2427C20.1965 16.6332 19.5635 16.6332 19.1731 16.2427C18.7827 15.8521 18.7827 15.219 19.1731 14.8284L21.001 13H9.99808C9.44597 13 8.9984 12.5523 8.9984 12Z", fill: "currentColor" })));
}
export default SvgLogOut;
