import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgChevronRight(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, props),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M9.71294 4.2968C9.32241 4.68749 9.32241 5.32092 9.71294 5.71161L16.002 12.0038L9.71294 18.296C9.32241 18.6867 9.32241 19.3201 9.71294 19.7108C10.1035 20.1015 10.7366 20.1015 11.1272 19.7108L17.4163 13.4186C18.1973 12.6372 18.1973 11.3704 17.4163 10.589L11.1272 4.2968C10.7366 3.90611 10.1035 3.90611 9.71294 4.2968Z", fill: "currentColor" })));
}
export default SvgChevronRight;
