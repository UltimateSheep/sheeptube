import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Button } from "react-bootstrap";
// import { getUser, getUserToken } from "../utils/tokenCheck";
import { useRouter } from "next/router";
import react, { useState, useEffect } from "react";
import { ParseCookies } from "./cookies/";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import Link from "next/link";

export default function Home({ data }) {
  const router = useRouter();
  const [User, setUser] = useState({});
  const [Token, setToken] = useState("");
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    const docRef = doc(db, "db", "channels");
    const docSnap = await getDoc(docRef);
    const vidRef = doc(db, "db", "videos");
    const vidSnap = await getDoc(vidRef);

    if (docSnap.exists() && vidSnap.exists()) {
      const snapshot = docSnap.data();
      const vidData = vidSnap.data();

      const { uid } = User;
      console.log(User);

      const sortedVids = Object.values(vidData).sort((a, b) => {
        return b["createdAt"].seconds - a["createdAt"].seconds;
      });
      console.log("sorted", sortedVids);

      const allVideos = sortedVids.map((e, i) => {
        console.log(i, e);
        const t = new Date(e["createdAt"].seconds * 1000);
        console.log(t);
        if (!(e["author"] in snapshot)) {
          return <></>;
        }

        return (
          <div
            className="videos"
            style={{
              display: "inline-block",
              marginRight: "30px",
              marginBottom: "30px",
              width: "350px",
            }}
            key={i}
          >
            <Link href={`${location.origin}/v/${e["id"]}`} key={i}>
              <a
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginRight: "20px",

                  overflowWrap: "normal",
                }}
              >
                <video
                  src={e["url"]}
                  style={{
                    maxWidth: "660px",
                    maxHeight: "240px",
                    margin: "0 auto",
                    display: "block",
                    backgroundColor: "black",
                  }}
                  width={360}
                  height={200}
                  id="video"
                />
                <p style={{ textAlign: "left", marginBottom: "1px" }}>
                  {e["title"]}
                </p>
                <p
                  style={{
                    textAlign: "left",
                    color: "gray",
                    marginBottom: "1px",
                    fontSize: "15px",
                  }}
                >
                  - {t.toLocaleString("en-US")}
                </p>
              </a>
            </Link>
            <Link href={`${location.origin}/c/${e["author"]}`}>
              <a
                style={{
                  // color: "black",
                  textDecoration: "none",
                  marginRight: "20px",
                  marginTop: "-20px",
                  width: "480px",
                  textAlign: "left",
                }}
              >
                by {snapshot[e["author"]]["name"]}
              </a>
            </Link>
          </div>
        );
      });
      setVideos(allVideos);
    }
  };

  useEffect(() => {
    // if (typeof data === "undefined") {
    //   router.reload();
    //   return;
    // }
    // // console.log(data)
    // const dataJSON = JSON.parse(data);
    // const { user, token } = dataJSON;

    // setUser(...JSON.parse(user));
    // setToken(token);

    fetchVideos();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Sheeptube</title>
      </Head>
      <div>
        <h1>Welcome</h1>
        <h2>to Sheeptube. let&#39;s refresh with these daily videos!</h2>
        <hr />
        {videos.length === 0 ? (
          <h4>Loading...</h4>
        ) : (
          <div
            style={{
              display: "inline-grid",
              gridTemplateColumns: "auto auto auto",
            }}
          >
            {videos}
          </div>
        )}
      </div>
    </div>
  );
}

// idk just add to ever pages
export async function getServerSideProps({ req, res }) {
  let data = null;

  // console.log("hi, ", ParseCookies(req));
  // if (res && ParseCookies(req) !== "") {
  //   data = JSON.parse(JSON.stringify(ParseCookies(req)));
  //   console.log(data);
  //   if (Object.keys(data).length < 2) {
  //     return {
  //       redirect: {
  //         permanent: true,
  //         destination: `/login`,
  //       },
  //     };
  //   }
  // }

  return {
    props: {
      data: false, //data && JSON.stringify(data)
    },
  };
}
