import React, { useEffect, useState } from "react";
import { ParseCookies } from "../cookies";

const Channels = () => {




  return(
    <div>
      <h1>Please, input id. This is just empty page</h1>
    </div>
  );
};
export async function getServerSideProps({ req, res }) {
  let data = null;

  console.log("hi, ", ParseCookies(req));
  if (res && ParseCookies(req) !== "") {
    data = JSON.parse(JSON.stringify(ParseCookies(req)));
    console.log(data);
    if (!Object.keys(data).length) {
      return {
        redirect: {
          permanent: true,
          destination: `/login`,
        },
      };
    }
  }

  return {
    props: {
      data: data && JSON.stringify(data),
    },
  };
}

export default Channels;
