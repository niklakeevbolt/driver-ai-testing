import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgClear({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M12 23C18.0751 23 23 18.0751 23 12C23 5.92493 18.0751 1 12 1C5.92487 1 1 5.92493 1 12C1 18.0751 5.92487 23 12 23ZM8.41143 7.10327C8.05019 6.74207 7.46452 6.74207 7.10328 7.10327C6.74204 7.46448 6.74204 8.05017 7.10328 8.41138L10.6918 12L7.10328 15.5886C6.74204 15.9498 6.74204 16.5355 7.10328 16.8967C7.46452 17.2579 8.05019 17.2579 8.41143 16.8967L12 13.3081L15.5886 16.8967C15.9498 17.2579 16.5355 17.2579 16.8967 16.8967C17.2579 16.5355 17.2579 15.9498 16.8967 15.5886L13.3081 12L16.8967 8.41138C17.2579 8.05017 17.2579 7.46448 16.8967 7.10327C16.5355 6.74207 15.9498 6.74207 15.5886 7.10327L12 10.6919L8.41143 7.10327Z", fill: "currentColor" })));
}
export default SvgClear;
