import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgSend({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "data-rtl-mirror": true, ...props },
        React.createElement("path", { d: "M21.1662 13.3446L4.15745 21.8428C3.02234 22.41 1.68977 21.3065 2.05896 20.0678L4.18734 12.9262H13.0513C13.5606 12.9262 13.9734 12.5116 13.9734 12.0002C13.9734 11.4888 13.5606 11.0742 13.0513 11.0742H4.18734L2.05896 3.93259C1.69848 2.72301 2.99448 1.57648 4.15745 2.15754L21.1662 10.6557C22.2347 11.1895 22.2597 12.7983 21.1662 13.3446Z", fill: "currentColor" })));
}
export default SvgSend;
