import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgSurge(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, props),
        React.createElement("path", { opacity: 0.72, d: "M12 0L19.9713 4.42849C20.6062 4.78123 21 5.45047 21 6.17681V6.60097C21 8.12594 19.3618 9.08988 18.0287 8.34929L12 5L5.97129 8.34929C4.63822 9.08988 3 8.12594 3 6.60097V6.17681C3 5.45047 3.39378 4.78123 4.02871 4.42849L12 0Z", fill: "currentColor" }),
        React.createElement("path", { opacity: 0.48, d: "M12 7L19.9713 11.4285C20.6062 11.7812 21 12.4505 21 13.1768V13.601C21 15.1259 19.3618 16.0899 18.0287 15.3493L12 12L5.97129 15.3493C4.63822 16.0899 3 15.1259 3 13.601V13.1768C3 12.4505 3.39378 11.7812 4.02871 11.4285L12 7Z", fill: "currentColor" }),
        React.createElement("path", { opacity: 0.24, d: "M12 14L19.9713 18.4285C20.6062 18.7812 21 19.4505 21 20.1768V20.601C21 22.1259 19.3618 23.0899 18.0287 22.3493L12 19L5.97129 22.3493C4.63822 23.0899 3 22.1259 3 20.601V20.1768C3 19.4505 3.39378 18.7812 4.02871 18.4285L12 14Z", fill: "currentColor" })));
}
export default SvgSurge;
