// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "../../../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import stream from "stream";
import { promisify } from "util";
import request from 'request';

const pipeline = promisify(stream.pipeline);

export default async function handler(req, res) {
  const docRef = doc(db, "db", "videos");
  const docSnap = await getDoc(docRef);
  const docData = docSnap.data();
  const id = req["query"]["id"][0];
  const url = docData[id]["url"];

  request.get(url).pipe(res)
}
