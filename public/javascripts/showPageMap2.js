mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map2', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: room.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
})

map.addControl(new mapboxgl.NavigationControl())

new mapboxgl.Marker()
    .setLngLat(room.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<h3>${room.title}</h3><p>${room.location}</p>`
        )
    )
    .addTo(map)