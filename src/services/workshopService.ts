import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
  
  import { initialWorkshops } from "../data/mockData";
import { db } from "../lib/firebase";
import type { Workshop } from "../types";
  
  const workshopsCollection = collection(db, "workshops");
  
  const cleanUndefined = (
    data: Record<string, unknown>
  ): Record<string, unknown> => {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== undefined
      )
    );
  };
  
  const normalizeWorkshop = (
    id: string,
    data: Partial<Workshop>
  ): Workshop => {
    const registrationType =
      data.registrationType || "individual";
  
    return {
      id,
      title: data.title || "",
      posterUrl:
        data.posterUrl ||
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
      dateTime: data.dateTime || "",
      venue: data.venue || "",
      resourcePerson: data.resourcePerson || "",
      description: data.description || "",
  
      registrationType,
  
      ...(registrationType === "team"
        ? {
            teamMinSize: data.teamMinSize || 2,
            teamMaxSize: data.teamMaxSize || 5,
          }
        : {}),
  
      googleFormUrl: data.googleFormUrl || "",
      status: data.status || "Open",
      category:
        data.category || "Literature Workshop",
      createdById:
        data.createdById || "system",
    };
  };
  
  /* ============================================================
     GET WORKSHOPS
  ============================================================ */
  
  export const getWorkshopsFromFirebase =
    async (): Promise<Workshop[]> => {
      const snapshot = await getDocs(
        workshopsCollection
      );
  
      return snapshot.docs.map((workshopDoc) =>
        normalizeWorkshop(
          workshopDoc.id,
          workshopDoc.data() as Partial<Workshop>
        )
      );
    };
  
  /* ============================================================
     SEED INITIAL WORKSHOPS
     Runs only when called by staff/admin code.
  ============================================================ */
  
  export const seedInitialWorkshopsToFirebase =
    async (): Promise<Workshop[]> => {
      const snapshot = await getDocs(
        workshopsCollection
      );
  
      if (!snapshot.empty) {
        return snapshot.docs.map((workshopDoc) =>
          normalizeWorkshop(
            workshopDoc.id,
            workshopDoc.data() as Partial<Workshop>
          )
        );
      }
  
      const batch = writeBatch(db);
  
      const seededWorkshops = initialWorkshops.map(
        (workshop) =>
          normalizeWorkshop(
            workshop.id,
            workshop as Partial<Workshop>
          )
      );
  
      seededWorkshops.forEach((workshop) => {
        const workshopRef = doc(
          db,
          "workshops",
          workshop.id
        );
  
        batch.set(
          workshopRef,
          cleanUndefined(
            workshop as unknown as Record<
              string,
              unknown
            >
          )
        );
      });
  
      await batch.commit();
  
      return seededWorkshops;
    };
  
  /* ============================================================
     CREATE WORKSHOP
  ============================================================ */
  
  export const createWorkshopInFirebase =
    async (
      data: Partial<Workshop>,
      createdById: string
    ): Promise<Workshop> => {
      const workshopRef = doc(
        workshopsCollection
      );
  
      const workshop = normalizeWorkshop(
        workshopRef.id,
        {
          ...data,
          createdById,
        }
      );
  
      await setDoc(
        workshopRef,
        cleanUndefined(
          workshop as unknown as Record<
            string,
            unknown
          >
        )
      );
  
      return workshop;
    };
  
  /* ============================================================
     UPDATE WORKSHOP
  ============================================================ */
  
  export const updateWorkshopInFirebase =
    async (
      id: string,
      data: Partial<Workshop>
    ): Promise<void> => {
      const workshopRef = doc(
        db,
        "workshops",
        id
      );
  
      await updateDoc(
        workshopRef,
        cleanUndefined(
          data as Record<string, unknown>
        )
      );
    };
  
  /* ============================================================
     DELETE WORKSHOP
  ============================================================ */
  
  export const deleteWorkshopInFirebase =
    async (id: string): Promise<void> => {
      const workshopRef = doc(
        db,
        "workshops",
        id
      );
  
      await deleteDoc(workshopRef);
    };