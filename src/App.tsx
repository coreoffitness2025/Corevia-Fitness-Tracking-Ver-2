// useEffect(() => {
//   const unsubscribe = onAuthStateChanged(auth, (user) => {
//     if (user) {
//       setUser({
//         uid: user.uid,
//         displayName: user.displayName || '사용자',
//         email: user.email || '',
//         photoURL: user.photoURL || undefined
//       });
//     } else {
//       setUser(null);
//     }
//   });
//   return () => unsubscribe();
// }, [setUser]);
