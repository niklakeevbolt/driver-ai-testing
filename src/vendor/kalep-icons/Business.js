import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgBusiness(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, props),
        React.createElement("path", { d: "M22 19C21.9999 20.1045 21.1045 21 20 21H4C2.89549 21 2.0001 20.1045 2 19V12.1602C5.14294 13.5291 8.56821 14.293 12 14.293C15.4314 14.293 18.8574 13.5291 22 12.1602V19Z", fill: "currentColor" }),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M12 0C14.4853 0 16.5 2.01472 16.5 4.5V5H20C21.1046 5 22 5.89543 22 7V10.1348C18.8547 11.5679 15.4726 12.4434 12 12.4434C8.52663 12.4434 5.14622 11.5668 2 10.1348V7C2 5.89543 2.89543 5 4 5H7.5V4.5C7.5 2.01472 9.51472 0 12 0ZM12 2C10.6193 2 9.5 3.11929 9.5 4.5V5H14.5V4.5C14.5 3.11929 13.3807 2 12 2Z", fill: "currentColor" })));
}
export default SvgBusiness;
