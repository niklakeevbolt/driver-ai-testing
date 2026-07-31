import * as React from "react";
const sizes = {
    xs: 16,
    sm: 20,
    md: 20,
    lg: 24,
    xl: 36,
};
function SvgUser(props) {
    return (React.createElement("svg", Object.assign({ width: sizes[props.size || "lg"], height: sizes[props.size || "lg"], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, props),
        React.createElement("path", { d: "M7.49994 6.5C7.49994 4.01472 9.51466 2 11.9999 2C14.4852 2 16.4999 4.01472 16.4999 6.5C16.4999 8.98528 14.4852 11 11.9999 11C9.51466 11 7.49994 8.98528 7.49994 6.5Z", fill: "currentColor" }),
        React.createElement("path", { d: "M4.98606 13.4613C7.39493 12.8241 9.734 12.4998 12.0009 12.5C14.2675 12.5002 16.6059 12.8247 19.0136 13.4616C19.8897 13.6933 20.4998 14.483 20.4999 15.3851L20.5001 19.9997C20.5001 21.1044 19.6086 21.9999 18.5039 21.9998C14.7123 21.9995 6.73535 21.999 5.50092 22C4.39696 21.9998 3.50045 21.1084 3.5002 20.0097L3.49976 15.3851C3.49969 14.4829 4.1099 13.693 4.98606 13.4613Z", fill: "currentColor" })));
}
export default SvgUser;
