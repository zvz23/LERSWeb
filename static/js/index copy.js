// Initialize and add the map
let map;
const departmentPosition = { lat: 8.604374, lng: 123.420602 };
const emergencyPositiion = { lat: 8.605910262131962, lng: 123.42057380575231 }

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  const origin = { lat: departmentPosition.lat, lng: departmentPosition.lng };
  const destination = { lat: emergencyPositiion.lat, lng: emergencyPositiion.lng };
  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: "bestguess"
      }
    },
    function (response, status) {
      if (status === "OK") {
        console.log(response)
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}


function addMarker(map, position) {
  const contentString = document.querySelector("div.markerInfoWindow").innerHTML
   
  const infowindow = new google.maps.InfoWindow({
    content: contentString,
    ariaLabel: "Uluru",
  });
  const marker = new google.maps.Marker({
    position: position,
    map,
    title: "Hello World!",
  });
  marker.addListener("mouseover", () => {
    infowindow.open({
      anchor: marker,
      map,
    });
  })
  
  marker.addListener("click", () => {

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    directionsService.route(
      {
        origin: departmentPosition,
        destination: marker.position,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: "bestguess"
        }
      },
      function (response, status) {
        if (status === "OK") {
          console.log(response)
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );


  });

  // setTimeout(removeMarker, 5000, marker);

}

function removeMarker(marker) {
  marker.setMap(null);
}



async function initMap() {
  
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  const areaOfResponsibility = [
    { lng: 123.4167567014492, lat: 8.610816575320113 },
    { lng: 123.4163030701227, lat: 8.602049644861719 },
    { lng: 123.4189054560571, lat: 8.600528724513783 },
    { lng: 123.4240471491281, lat: 8.604313119846987 },
    { lng: 123.4229819873506, lat: 8.609598233008589 },
    { lng: 123.420773986334, lat: 8.610747587805742 },
    { lng: 123.4167567014492, lat: 8.610816575320113 },
  ]

  const bermudaTriangle = new google.maps.Polygon({
    paths: areaOfResponsibility,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 4,
    fillColor: "#FF0000",
    fillOpacity: 0.00,
  });
  map = new Map(document.getElementById("map"), {
    zoom: 16,
    center: departmentPosition,
    mapId: "DEMO_MAP_ID",
  });

  bermudaTriangle.setMap(map);
  addMarker(map, departmentPosition)
  addMarker(map, emergencyPositiion)
  // const departmentMarker = new AdvancedMarkerElement({
  //   map: map,
  //   position: departmentPosition,
  //   title: "Lers Department",
  // });
  // const emergencyMarker = new AdvancedMarkerElement({
  //   map: map,
  //   position: emergencyPositiion,
  //   title: "Emergency Location",
  // });


  
}

initMap();