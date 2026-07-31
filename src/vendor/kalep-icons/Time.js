import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgTime({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M11.999 1C18.074 1 23 5.926 23 11.999C23 18.074 18.074 22.998 11.999 22.998C5.92403 22.998 1 18.074 1 11.999C1 5.92599 5.92403 1 11.999 1ZM12 4.0752C11.4891 4.0752 11.0752 4.48914 11.0752 5V11.5459L6.93164 14.7695C6.52851 15.0832 6.45593 15.6652 6.76953 16.0684C7.0832 16.4715 7.66515 16.5441 8.06836 16.2305L12.5684 12.7305L12.9248 12.4521V5C12.9248 4.48914 12.5109 4.0752 12 4.0752Z", fill: "currentColor" })));
}
export default SvgTime;
