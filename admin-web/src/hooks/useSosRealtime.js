import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { firestore as db } from '../firebase.js';

export function useSosRealtime() {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sosQuery = query(
      collection(db, 'sos_records'),
      where('status', 'in', ['active', 'dispatched']),
      orderBy('priorityScore', 'desc'),
    );

    const unsubscribe = onSnapshot(
      sosQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSosList(items);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { sosList, loading, error };
}
