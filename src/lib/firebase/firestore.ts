// src/lib/firebase/firestore.ts

import { getFirestore } from "firebase/firestore";
import { app } from "./client";

export const db = getFirestore(app);
