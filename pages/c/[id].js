import { async } from "@firebase/util";
import React, { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "react-bootstrap";
import { ParseCookies } from "../cookies";
import { doc, getDoc, setDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase-config";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";


const Details = ({ id, data }) => {
  // const router = useRouter();
  const [channel, setChannel] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [cookieData, setCookieData] = useState({});
  const [videos, setVideos] = useState([]);

  const fetchData = async (user) => {
    const docRef = doc(db, "db", "channels");
    const docSnap = await getDoc(docRef);
    const vidRef = doc(db, "db", "videos");
    const vidSnap = await getDoc(vidRef);

    if (docSnap.exists() && vidSnap.exists()) {
      const snapshot = docSnap.data();
      const vidData = vidSnap.data();

      const { uid } = user;
      console.log(user);

      setChannel(snapshot);
      console.log(snapshot);
      if (!(id in snapshot)) {
        setNotFoundError(true);
        return;
      }
      const selectedVideos = snapshot[id]["videos"]
      const sortedVids = Object.values(vidData).sort((a,b)=>{
        return b["createdAt"].seconds - a["createdAt"].seconds
      })
      console.log("sorted", sortedVids)

      const allVideos = sortedVids.map((e, i) => {
        console.log(i, e);
        const t = new Date(e["createdAt"].seconds * 1000)
        console.log(t);

        return e["author"] === id ? (
          <>
            <Link href={`${location.origin}/v/${e["id"]}`} key={i}>
              <a style={{ color: "black", textDecoration: "none", marginRight: "20px", width:"480px"}}>
                <video
                  src={e["url"]}
                  style={{
                    maxWidth: "480px",
                    maxHeight: "270px",
                    margin: "0 auto",
                    display: "block",
                  }}
                  id="video"
                />
                <p style={{textAlign: "center"}}>{e["title"]} - {t.toLocaleString("en-US")}</p>
              </a>
            </Link>
          </>
        ): <></>;
      });

      setChannel(snapshot[id]);
      setCookieData(user);
      setVideos(allVideos);
      setLoading(false);
      return;
    }
    alert("Error! no such doc exist!!!");
  };
  useEffect(() => {
    const parsedData = JSON.parse(data);
    const user = JSON.parse(parsedData["user"])[0];

    console.log(user);

    fetchData(user);
  }, []);

  return notFoundError ? (
    <div>
      <Head>
        <title>No user</title>
      </Head>
      <h1 style={{ color: "red" }}>NO CHANNEL WITH ID OF {id} EXISTS!</h1>
    </div>
  ) : !loading ? (
    <div>
      <Head>
        <title>User: {channel["name"]}</title>
      </Head>
      <div style={{ display: "flex", marginTop: "20px" }}>
        <Image
          style={{
            borderRadius: "50%",
            float: "left",
            display: "inline-block",
            flex: "none",
          }}
          src={channel["profilePicture"]}
          alt="image of channel"
          width="100px"
          height="100px"
        />
        <h1 style={{ marginTop: "25px", marginLeft: "20px" }}>
          {channel["name"]}
        </h1>
      </div>
      <textarea
        rows="10"
        cols="80"
        readOnly
        style={{ resize: "none", marginTop: "10px" }}
      >
        {channel["about"]}
      </textarea>
      <hr />
      <div className="videos">
        <h1>VIDEOS : </h1>
        {videos.length === 0 ? (
          <p>This channel doesn&#39;t have any videos.</p>
        ) : (
          <div style={{display:"inline-grid", gridTemplateColumns: "auto auto auto"}}>{videos}</div>
        )}
      </div>
    </div>
  ) : (
    <div>
      <Head>
        <title>Loading...</title>
      </Head>
      <h1>Loading...</h1>
    </div>
  );
};

export async function getServerSideProps({ query, res, req }) {
  let data = null;

  console.log("hi, ", ParseCookies(req));
  if (res && ParseCookies(req) !== "") {
    data = JSON.parse(JSON.stringify(ParseCookies(req)));
    console.log(data);
    if (Object.keys(data).length < 2) {
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
      id: query["id"],
      data: data && JSON.stringify(data),
    },
  };
}

export default Details;
