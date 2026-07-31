import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgStar(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, props),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M10.8056 0.850854C11.1711 -0.295835 12.8395 -0.271335 13.1972 0.850854L15.2946 7.43204H22.2626C23.4649 7.43204 23.9499 9.01605 22.994 9.69998L17.3275 13.7542L19.5276 20.3578C19.9086 21.5015 18.5401 22.4599 17.5898 21.7577L12.0014 17.6274L6.41296 21.7577C5.44203 22.4752 4.10225 21.4772 4.47518 20.3578L6.67527 13.7542L1.00878 9.69998C0.0318697 9.00102 0.563717 7.43204 1.74019 7.43204H8.70817L10.8056 0.850854Z", fill: "currentColor" })));
}
export default SvgStar;
