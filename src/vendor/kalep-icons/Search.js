import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgSearch(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, props),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M2 11C2 6 6 2 11 2C16 2 20 6 20 11C20 13.1405 19.267 15.0976 18.0362 16.6362L22 20.6C22.4 21 22.4 21.6 22 22C21.6 22.4 21 22.4 20.6 22L16.6362 18.0362C15.0976 19.267 13.1405 20 11 20C6 20 2 16 2 11ZM18 11C18 7.1 14.9 4 11 4C7.1 4 4 7.1 4 11C4 14.9 7.1 18 11 18C14.9 18 18 14.9 18 11Z", fill: "currentColor" })));
}
export default SvgSearch;
