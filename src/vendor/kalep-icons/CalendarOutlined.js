import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgCalendarOutlined({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M9 3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3V4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V6C22 4.89543 21.1046 4 20 4H17V3C17 2.44772 16.5523 2 16 2C15.4477 2 15 2.44772 15 3V4H9V3ZM15 7V6H9V7C9 7.55228 8.55228 8 8 8C7.44772 8 7 7.55228 7 7V6H4V10H20V6H17V7C17 7.55228 16.5523 8 16 8C15.4477 8 15 7.55228 15 7ZM20 12H4V20H20V12Z", fill: "currentColor" })));
}
export default SvgCalendarOutlined;
