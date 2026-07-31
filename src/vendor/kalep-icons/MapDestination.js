import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgMapDestination({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 32 32", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("rect", { width: 32, height: 32, rx: 8, fill: "white" }),
        React.createElement("path", { d: "M0 8C0 3.58172 3.58172 0 8 0H12V12H0V8Z", fill: "#00140D", fillOpacity: 0.16 }),
        React.createElement("path", { d: "M20 0H24C28.4183 0 32 3.58172 32 8V24C32 28.4183 28.4183 32 24 32H20V0Z", fill: "#00140D", fillOpacity: 0.16 }),
        React.createElement("path", { d: "M0 20H12V32H8C3.58172 32 0 28.4183 0 24V20Z", fill: "#00140D", fillOpacity: 0.16 }),
        React.createElement("rect", { x: 0.5, y: 0.5, width: 31, height: 31, rx: 7.5, stroke: "#002D1E", strokeOpacity: 0.07 }),
        React.createElement("path", { d: "M24.0516 0C26.2194 0 28.1806 0.807854 29.729 2.32258C31.1742 3.83731 32 5.85694 32 7.97756C32 9.89621 31.2774 11.9158 29.729 14.0365C28.9615 15.1091 26.7968 17.2826 25.3591 18.6883C24.6006 19.43 23.3977 19.4311 22.6375 18.6911C21.1636 17.2565 18.923 15.0153 18.1677 13.9355C16.7226 11.9158 16 9.79523 16 7.7756C16 5.65498 16.8258 3.73633 18.3742 2.2216C19.9226 0.807854 21.8839 0 24.0516 0Z", fill: "#4F5BDA" }),
        React.createElement("circle", { cx: 24, cy: 8, r: 3, fill: "white" })));
}
export default SvgMapDestination;
