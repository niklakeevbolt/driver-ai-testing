import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgMoreAndroid({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "data-rtl-mirror": true, ...props },
        React.createElement("path", { d: "M12.25 2C11.0074 2 10 3.00497 10 4.24466C10 5.48435 11.0074 6.48931 12.25 6.48931C13.4926 6.48931 14.5 5.48435 14.5 4.24466C14.5 3.00497 13.4926 2 12.25 2Z", fill: "currentColor" }),
        React.createElement("path", { d: "M12.25 9.75534C11.0074 9.75534 10 10.7603 10 12C10 13.2397 11.0074 14.2447 12.25 14.2447C13.4926 14.2447 14.5 13.2397 14.5 12C14.5 10.7603 13.4926 9.75534 12.25 9.75534Z", fill: "currentColor" }),
        React.createElement("path", { d: "M12.25 17.5107C11.0074 17.5107 10 18.5157 10 19.7553C10 20.995 11.0074 22 12.25 22C13.4926 22 14.5 20.995 14.5 19.7553C14.5 18.5157 13.4926 17.5107 12.25 17.5107Z", fill: "currentColor" })));
}
export default SvgMoreAndroid;
