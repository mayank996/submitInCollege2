require('dotenv').config();
const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers') 
const Room = require('../models/room');

mongoose.connect(process.env.DB_URI, {
    "user": process.env.DB_USERNAME,
    "pass": process.env.DB_PASSWORD,
    "useNewUrlParser": true, 
    "useUnifiedTopology": true,
    "useCreateIndex": true,
    "authSource": "admin"
})
    .then(() => {
        console.log("Mongoose connected to mongodb successfully.");
    })
    .catch(err => {
        console.log(err);
    });

const sample = array => array[Math.floor(Math.random()*array.length)]

const seedDB = async () => {
    await Room.deleteMany({});
    for(let i=0; i<300; i++){
        const random1000 = Math.floor(Math.random()*1000)
        const price = Math.floor(Math.random()*20)+10
        const room = new Room({
            author: '627bb5c2d7eb392a87e0ec3f',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quod reiciendis dolores placeat excepturi repudiandae numquam doloribus perferendis commodi, necessitatibus sapiente unde! Cum earum molestias, dolor quo voluptatibus voluptates deleniti. Nemo perferendis rerum suscipit sequi culpa ut expedita facere labore distinctio ipsam sit quidem nisi in voluptas unde quisquam ipsa, voluptate, blanditiis quae accusantium a, officiis voluptates explicabo aut! Error in at, odio ipsam a consequatur architecto velit incidunt! Velit?',
            price,
            geometry: { 
                type: 'Point', 
                coordinates: [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/m96/image/upload/v1639416126/findMyRoom/home-2486092_960_720_hcvj3m.webp',
                  filename: 'findMyRoom/home-2486092_960_720_hcvj3m'
                },
                {
                  url: 'https://res.cloudinary.com/m96/image/upload/v1639416121/findMyRoom/library-5219747_960_720_lceqry.webp',
                  filename: 'findMyRoom/library-5219747_960_720_lceqry'
                },
                {
                  url: 'https://res.cloudinary.com/m96/image/upload/v1639416121/findMyRoom/interior-2685521_960_720_fkuj1o.webp',
                  filename: 'findMyRoom/interior-2685521_960_720_fkuj1o'
                }
              ]
        })
        await room.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})