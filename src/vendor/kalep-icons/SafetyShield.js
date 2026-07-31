import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgSafetyShield({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M10.9466 1.19528C11.6258 0.940602 12.3742 0.940602 13.0534 1.19528L20.3511 3.93194C20.7414 4.07831 21 4.45143 21 4.86827V11C21 16.1766 18.0085 20.1362 12.4443 22.8959C12.1644 23.0347 11.8356 23.0347 11.5557 22.8959C5.99148 20.1362 3 16.1766 3 11V4.86827C3 4.45143 3.25857 4.07831 3.64888 3.93194L10.9466 1.19528ZM8.75728 10.6465C8.36675 10.256 7.73359 10.256 7.34306 10.6465C6.95254 11.0371 6.95254 11.6702 7.34306 12.0608L9.40894 14.1266C10.19 14.9077 11.4563 14.9077 12.2374 14.1266L16.6569 9.70711C17.0474 9.31658 17.0474 8.68342 16.6569 8.29289C16.2664 7.90237 15.6332 7.90237 15.2427 8.29289L10.8232 12.7124L8.75728 10.6465Z", fill: "currentColor" })));
}
export default SvgSafetyShield;
