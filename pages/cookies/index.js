import cookie from "cookie";
import React from "react";

const Cookies = () => {
  return <div>Hey! you&#39re not supposed to be here</div>;
};

export function ParseCookies(req) {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie);
}

export default Cookies;
