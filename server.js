const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');  // Add this line
const app = express();
const axios = require('axios')
const port = 5000;

// Replace YOUR_MONGODB_CONNECTION_STRING with your MongoDB connection string
const mongoURI = 'mongodb+srv://siraj:2FJ63FMlPnQHHpcT@cluster0.xxdhvm1.mongodb.net/LOGIN_DB?retryWrites=true&w=majority';

// Connect to MongoDB
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to get user locations
app.get('/userdata', async (req, res) => {
    try {
        await client.connect();
        const database = client.db("LOGIN_DB");
        const collection = database.collection("users");

        // Fetch all user documents with location
        const userdata = await collection.find().toArray();

        // Array to store promises
        const axiosPromises = [];

        for(let data of userdata) {

            const lati_and_longi = data.location.split(',');

            const axiosPromise = axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lati_and_longi[0]}&lon=${lati_and_longi[1]}&format=json`)
                .then(response => {
                    // Handle success
                    console.log('Response:', response.data.display_name);
                    // Add address to user data
                    data.address = response.data.display_name;
                })
                .catch(error => {
                    // Handle error
                    console.error('Error:', error);
                });

            console.log(axiosPromise , "response after api ")
            axiosPromises.push(axiosPromise);
        }

        // Wait for all Axios requests to complete
        await Promise.all(axiosPromises);

        // Send response with updated user data
        console.log(userdata, "userdata")
        res.json(userdata);
        
       
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});


app.post('/api/deleteLocation', async (req, res) => {
    const { latitude, longitude } = req.body;

    try {
        await client.connect();
        const database = client.db("LOGIN_DB");
        const collection = database.collection("users");

        // Delete the document with the specified latitude and longitude
        const result = await collection.deleteOne({ location: `${latitude}, ${longitude}` });

        if (result.deletedCount > 0) {
            res.json({ message: 'Location deleted successfully' });
        } else {
            res.status(404).json({ error: 'Location not found' });
        }
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});


app.get('/analyticpage', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'analytic.html'));
})

app.get('/users', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'users.html'));
});


app.get('/totalusers', async (req, res)=>{
    try {
        // Connect to the MongoDB client
        await client.connect();
        const database = client.db("LOGIN_DB");
        const collection = database.collection("users");

        // Count the total number of documents in the "users" collection
        const totalUsers = await collection.countDocuments();

        // You could also send this data back to the client
        console.log(`Total number of users: ${totalUsers}`);
        res.json({ totalUsers: totalUsers });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // It's important to close the client connection
        await client.close();
    }

})

app.get('/analytics', async (req, res) => {
    try {
        await client.connect();
        const database = client.db("LOGIN_DB");
        const collection = database.collection("users");

        // Fetch all user documents with location
        const userdata = await collection.find().toArray();

        // Array to store promises
        const axiosPromises = [];

        for(let data of userdata) {

            const lati_and_longi = data.location.split(',');

            const axiosPromise = axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lati_and_longi[0]}&lon=${lati_and_longi[1]}&format=json`)
                .then(response => {
                    // Handle success
                    console.log('Response:', response.data.display_name);
                    // Add address to user data
                    data.address = response.data.display_name;
                })
                .catch(error => {
                    // Handle error
                    console.error('Error:', error);
                });

            console.log(axiosPromise , "response after api ")
            axiosPromises.push(axiosPromise);
        }

        // Wait for all Axios requests to complete
        await Promise.all(axiosPromises);

        // Send response with updated user data
        console.log(userdata, "anaylytics")
        res.json(userdata);
        
       
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

// Serve the HTML file
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
