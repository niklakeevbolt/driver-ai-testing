import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgCall({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M8.45165 15.5486C11.0522 18.1492 14.3895 19.9826 17.9906 20.7353C19.0653 20.9599 20.1202 20.2762 20.354 19.2034L20.7319 17.4691C20.9164 16.6224 20.5347 15.7532 19.7864 15.3162L18.0299 14.2904C17.0895 13.7412 15.9254 13.7448 14.9884 14.2996L13.2005 15.3584L8.64124 10.7992L9.70005 9.01125C10.2549 8.07426 10.2585 6.91016 9.70934 5.9698L8.6838 4.2136C8.24688 3.4654 7.37789 3.08362 6.53129 3.26792L4.79702 3.64546C3.7241 3.87902 3.04016 4.9339 3.26471 6.00871C4.01719 9.61012 5.85091 12.9478 8.45165 15.5486Z", fill: "currentColor" })));
}
export default SvgCall;
