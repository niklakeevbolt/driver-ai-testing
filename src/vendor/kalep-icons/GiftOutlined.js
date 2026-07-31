import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgGiftOutlined({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M4 5H6.33682C6.12085 4.54537 6 4.0368 6 3.5C6 1.567 7.567 0 9.5 0C10.4793 0 11.3647 0.402235 12 1.05051C12.6353 0.402235 13.5207 0 14.5 0C16.433 0 18 1.567 18 3.5C18 4.0368 17.8792 4.54537 17.6632 5H20C21.1046 5 22 5.89543 22 7V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V7C2 5.89543 2.89543 5 4 5ZM13 3.5C13 2.67157 13.6716 2 14.5 2C15.3284 2 16 2.67157 16 3.5C16 4.32843 15.3284 5 14.5 5H13V3.5ZM11 5H9.5C8.67157 5 8 4.32843 8 3.5C8 2.67157 8.67157 2 9.5 2C10.3284 2 11 2.67157 11 3.5V5ZM13 7H20V12.5H13V7ZM11 7H4V12.5H11V7ZM4 14.5V20H11V14.5H4ZM13 20H20V14.5H13V20Z", fill: "currentColor" })));
}
export default SvgGiftOutlined;
