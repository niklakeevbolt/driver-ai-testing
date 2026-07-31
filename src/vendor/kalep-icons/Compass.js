import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
/** @deprecated This icon is deprecated and will be removed in a future version. */
function SvgCompass(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, props),
        React.createElement("path", { d: "M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z", fill: "currentColor" }),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM18.4669 6.8534L16.1815 13.6437C15.7832 14.8271 14.8551 15.7566 13.6723 16.1567L6.8598 18.4615C6.0873 18.7228 5.34009 17.957 5.58974 17.2008L7.84555 10.3674C8.24348 9.16193 9.18996 8.21694 10.396 7.82091L17.2072 5.58432C17.9807 5.33034 18.7205 6.09994 18.4669 6.8534Z", fill: "currentColor" })));
}
export default SvgCompass;
