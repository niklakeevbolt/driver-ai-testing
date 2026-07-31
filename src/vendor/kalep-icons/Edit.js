import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgEdit(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "data-rtl-mirror": true }, props),
        React.createElement("path", { d: "M20.1251 0.881007C21.2961 2.05292 21.2986 3.9553 20.1268 5.12648L19.3305 5.92231L15.0822 1.67399L15.8779 0.877815C17.0497 -0.294698 18.9534 -0.291572 20.1251 0.881007Z", fill: "currentColor" }),
        React.createElement("path", { d: "M17.916 7.33616L13.6685 3.08865L3.87868 12.8846C3.31607 13.4472 3 14.2103 3 15.0059V18.0044H6C6.79565 18.0044 7.55871 17.6883 8.12132 17.1257L17.916 7.33616Z", fill: "currentColor" }),
        React.createElement("path", { d: "M2 21.0059C2 20.4536 2.44772 20.0059 3 20.0059H21C21.5523 20.0059 22 20.4536 22 21.0059C22 21.5582 21.5523 22.0059 21 22.0059H3C2.44772 22.0059 2 21.5582 2 21.0059Z", fill: "currentColor" })));
}
export default SvgEdit;
