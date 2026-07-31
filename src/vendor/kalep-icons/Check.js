import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgCheck({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M5.70928 11.6707C5.31774 11.2791 4.68353 11.2786 4.29272 11.6694C3.90191 12.0602 3.9025 12.6944 4.29404 13.0859L7.9454 16.7373C8.72847 17.5204 9.9969 17.5215 10.7785 16.7399L19.8078 7.71059C20.1987 7.31979 20.1981 6.68557 19.8065 6.29404C19.415 5.9025 18.7808 5.90191 18.39 6.29272L9.36064 15.322L5.70928 11.6707Z", fill: "currentColor" })));
}
export default SvgCheck;
