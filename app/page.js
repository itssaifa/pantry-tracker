'use client';
import { useState, useEffect } from "react";
import { firestore } from "@/firebase"; 
import { Box, Modal, Typography, Stack, TextField, Button, InputAdornment } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [search, setSearch] = useState('');

  const pastelColors = [
    '#FFB3BA', // Light pink
    '#FFDFBA', // Light orange
    '#FFFFBA', // Light yellow
    '#BAFFC9', // Light green
    '#BAE1FF', // Light blue
    '#E2BAFF', // Light purple
  ];

  const updateInventory = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else { 
        await setDoc(docRef, { quantity: 1 });
      }

      await updateInventory();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const removeItem = async (item) => {
    try {
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
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={3}
      sx={{
        background: 'linear-gradient(135deg, #e0e0e0, #d0d0d0, #a0a0a0, #000000)' // Gray to black gradient
      }}
    >
      <Box width="100%" maxWidth="1200px">
        <Typography 
          variant="h2" 
          color="#ffffff" 
          align="center" 
          gutterBottom
          sx={{ 
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)', // Add shadow for better visibility
            fontSize: '3rem', // Increase font size
          }}
        >
          Stock Smart
        </Typography>
        <Typography 
          variant="h6" 
          color="#dddddd" 
          align="center" 
          gutterBottom
          sx={{ 
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)', // Add shadow for better visibility
            fontSize: '1.25rem', // Increase font size
          }}
        >
          Organize, Optimize, Simplify
        </Typography>

        <Stack 
          direction="row" 
          justifyContent="center" 
          mb={3}
        >
          <TextField
            variant="outlined"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  ⭐
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              // Remove border and outline styles
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',  // Remove the border color
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',  // Remove the border color on hover
                },
              },
              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
            }}
          />
        </Stack>

        <Box 
          border="2px solid #000000"  // Black border
          borderRadius="8px" 
          overflow="hidden"
        >
          <Box
            width="100%" 
            bgcolor="#333333" 
            display="flex"
            alignItems="center" 
            justifyContent="space-between"
            p={2}
          >
            <Typography variant="h4" color="#ffffff">
              Inventory Items
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleOpen}
              sx={{ backgroundColor: '#0033cc', ':hover': { backgroundColor: '#002a99' } }}
            >
              Add New Item
            </Button>
          </Box>
          <Stack spacing={2} p={2}>
            {filteredInventory.map(({ name, quantity }, index) => (
              <Box 
                key={name} 
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                bgcolor={pastelColors[index % pastelColors.length]} // Use pastel colors
                border="1px solid #ddd"
                borderRadius="8px"
                padding={2}
                boxShadow={1}
              >
                <Typography variant="h6" color="#333">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Stack 
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Button 
                    variant="contained" 
                    onClick={() => addItem(name)}
                    color="success"
                    sx={{ width: '40px', height: '40px' }}
                  >
                    +
                  </Button>
                  <Typography variant="h6" color="#333">
                    {quantity}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => removeItem(name)}
                    color="error"
                    sx={{ width: '40px', height: '40px' }}
                  >
                    -
                  </Button>
                </Stack>
                <Button 
                  variant="contained" 
                  onClick={() => removeItem(name)}
                  color="error"
                  sx={{ width: '80px', height: '40px' }}
                >
                  Delete
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%"
          width={400}
          bgcolor="#ffffff" 
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
    </Box>
  );
}