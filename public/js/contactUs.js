function initMap() {
  // The location of Kalyani Ice Cream Parlour
  const kalyaniIceCreamParlour = { lat: 19.8399, lng: 75.8868 };
  // The map, centered at Kalyani Ice Cream Parlour
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: kalyaniIceCreamParlour,
  });
  // The marker, positioned at Kalyani Ice Cream Parlour
  const marker = new google.maps.Marker({
    position: kalyaniIceCreamParlour,
    map: map,
  });
}



// Load the map when the page loads
window.onload = initMap;
