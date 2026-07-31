import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgAlert(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, props),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M22.6638 18L13.6638 2C13.2638 1.4 12.6638 1 11.9638 1C11.2638 1 10.5638 1.4 10.2638 2L1.26383 18C0.863826 18.6 0.963826 19.4 1.26383 20C1.66383 20.6 2.26383 21 2.96383 21H20.9638C21.6638 21 22.3638 20.6 22.6638 20C23.0638 19.4 23.0638 18.7 22.6638 18ZM10.9992 12.8L10.77 8.59814C10.7316 7.89296 11.293 7.30005 11.9992 7.30005C12.7055 7.30005 13.2669 7.89296 13.2285 8.59814L12.9992 12.8C12.9992 13.4 12.5992 13.8 11.9992 13.8C11.3992 13.8 10.9992 13.4 10.9992 12.8ZM12 17.6C12.6904 17.6 13.25 17.0404 13.25 16.35C13.25 15.6597 12.6904 15.1 12 15.1C11.3096 15.1 10.75 15.6597 10.75 16.35C10.75 17.0404 11.3096 17.6 12 17.6Z", fill: "currentColor" })));
}
export default SvgAlert;
