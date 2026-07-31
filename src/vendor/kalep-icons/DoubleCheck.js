import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgDoubleCheck({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M12.0369 15.5449C11.6466 15.9349 11.6466 16.5674 12.0369 16.9574C12.4271 17.3475 13.0599 17.3475 13.4502 16.9574L22.7073 7.70512C23.0976 7.31505 23.0976 6.68262 22.7073 6.29255C22.317 5.90248 21.6843 5.90248 21.294 6.29255L12.0369 15.5449Z", fill: "currentColor" }),
        React.createElement("path", { d: "M2.70601 10.7178C2.31573 10.3277 1.68298 10.3277 1.2927 10.7178C0.902432 11.1079 0.902432 11.7403 1.2927 12.1304L5.80241 16.6377C6.58295 17.4179 7.84847 17.4179 8.62901 16.6377L17.5663 7.70513C17.9565 7.31506 17.9565 6.68263 17.5663 6.29256C17.176 5.90249 16.5432 5.90249 16.153 6.29256L7.21571 15.2252L2.70601 10.7178Z", fill: "currentColor" })));
}
export default SvgDoubleCheck;
