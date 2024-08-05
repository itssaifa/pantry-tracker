'use client';
import { useState, useEffect } from "react";
import { firestore, auth } from "@/firebase"; // Ensure auth is imported from your firebase config
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged

export default function Home() {
  const [inventory, setInventory] = useState([]); // State variable to store inventory
  const [open, setOpen] = useState(false); // State variable to add and remove stuff; default value is false
  const [itemName, setItemName] = useState(''); // Default value is empty string
  const [user, setUser] = useState(null); // State variable for user authentication
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Fetch inventory from Firebase
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else { 
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory();
  };

  const handleAuth = async () => {
    if (isSignUp) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  useEffect(() => {
    updateInventory();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      {user ? (
        <>
          <Typography variant="h2" color="#222">
            Pantry Pulse
          </Typography>
          <Typography variant="h6" color="#777">
            Keep Your Pantry in Check
          </Typography>
          <Modal open={open} onClose={handleClose}>
            <Box 
              position="absolute" 
              top="50%" 
              left="50%"
              width={400}
              bgcolor="white"
              border="2px solid #000"
              boxShadow={24}
              p={4}
              display="flex"
              flexDirection="column"
              gap={3}
              sx={{
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Typography variant="h6">Add Item</Typography>
              <Stack width="100%" direction="row" spacing={2}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    addItem(itemName);
                    setItemName('');
                    handleClose();
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Button 
            variant="contained" 
            onClick={handleOpen}
          >
            Add New Item
          </Button>
          <Box border="1px solid #333">
            <Box
              width="800px" 
              height="100px" 
              bgcolor="#ADD8E6" 
              display="flex"
              alignItems="center" 
              justifyContent="center"
            >
              <Typography variant="h2" color="#333">
                Inventory Items
              </Typography>
            </Box>
            <Stack width="800px" height="300px" spacing={2} overflow="auto">
              {inventory.map(({ name, quantity }) => (
                <Box 
                  key={name} 
                  width="100%"
                  minHeight="150px"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  backgroundColor="#f0f0f0"
                  padding={5}
                >
                  <Typography variant="h3" color="#333" textAlign="center">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h3" color="#333" textAlign="center">
                    {quantity}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => removeItem(name)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
          </Box>
        </>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h4">{isSignUp ? "Sign Up" : "Log In"}</Typography>
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" onClick={handleAuth}>
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>
          <Button variant="text" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </Button>
        </Box>
      )}
    </Box>
  );
}