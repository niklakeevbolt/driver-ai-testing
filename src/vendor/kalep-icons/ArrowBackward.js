import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgArrowBackward({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "data-rtl-mirror": true, ...props },
        React.createElement("path", { d: "M10.2853 5.70326C10.6758 5.31274 10.6758 4.67957 10.2853 4.28905C9.89477 3.89852 9.26159 3.89852 8.87107 4.28905L2.59004 10.5817C1.80899 11.3628 1.80899 12.6291 2.59004 13.4102L8.87743 19.7055C9.26795 20.096 9.90113 20.096 10.2916 19.7055C10.6822 19.315 10.6822 18.6818 10.2916 18.2913L5.00387 13H21C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11H5.00387L10.2853 5.70326Z", fill: "currentColor" })));
}
export default SvgArrowBackward;
