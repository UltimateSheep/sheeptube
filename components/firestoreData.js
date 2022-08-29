import { ParseCookies } from "../pages/cookies";

export const firestoreData = () => {
  let data = null;
  if (res && ParseCookies(req) !== "") {
    data = JSON.parse(JSON.stringify(ParseCookies(req)));
    console.log(data);
    if (Object.keys(data).length) {
      return {
        redirect: {
          permanent: false,
          destination: `/`,
        },
      };
    }
    // return {
    //   redirect: {
    //     permanent: false,
    //     destination: `/`,
    //   },
    // };
  }

  return {
    data: data && JSON.stringify(data),
  };
};
