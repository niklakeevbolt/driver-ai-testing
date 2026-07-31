import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgPackage({ size, ref, ...props }) {
    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M17.122 7.82691L20.5 5.83981L13.014 1.43629C12.3881 1.06811 11.6119 1.06811 10.986 1.43629L8.62193 2.82689L17.122 7.82691Z", fill: "currentColor" }),
        React.createElement("path", { d: "M6.89616 3.84205L3.49999 5.8398L12 10.8398L15.3962 8.84207L6.89616 3.84205Z", fill: "currentColor" }),
        React.createElement("path", { d: "M2.5 7.57192V16.428C2.5 17.1368 2.87508 17.7926 3.48596 18.1519L10.986 22.5637L11 22.5718L11 12.5719L10.986 12.5637L2.5 7.57192Z", fill: "currentColor" }),
        React.createElement("path", { d: "M13.014 22.5637L13 22.5718L13 12.5719L13.0141 12.5637L21.5 7.57196V16.428C21.5 17.1368 21.1249 17.7926 20.514 18.1519L13.014 22.5637Z", fill: "currentColor" })));
}
export default SvgPackage;
