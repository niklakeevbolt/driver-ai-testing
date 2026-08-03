import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgSupport({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1 12C1 5.9 5.9 1 12 1C18.1 1 23 5.9 23 12C23 18.1 18.1 23 12 23C10 23 8.1 22.5 6.6 21.6L2.8 22.6H2.5C1.8 22.6 1.3 21.9 1.5 21.3L2.5 17.5C1.5 15.9 1 14 1 12ZM12 6C11.3096 6 10.75 6.55964 10.75 7.25C10.75 7.94036 11.3096 8.5 12 8.5C12.6904 8.5 13.25 7.94036 13.25 7.25C13.25 6.55964 12.6904 6 12 6ZM13 11.1192L13 11.11C13 10.5577 12.5523 10.11 12 10.11H10C9.44772 10.11 9 10.5577 9 11.11C9 11.6623 9.44772 12.11 10 12.11H11V17.0996C11 17.6598 11.4477 18.114 12 18.114C12.5523 18.114 13 17.6598 13 17.0996V11.1285L13 11.1192Z", fill: "currentColor" })));
}
export default SvgSupport;
