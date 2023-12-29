let map;
const departmentPosition = { lat: 8.604374, lng: 123.420602 };
let directionsService = undefined;
let markers = {}
let renderers = {}
let callLogs = {}

let trackBtn = document.querySelector("button#track");
let statusModalEl = document.querySelector("#statusModal")
let statusModalLabel = document.querySelector("#modalLabel");
let statusModalBody = document.querySelector("#modalBody");
let statusModal = new bootstrap.Modal(statusModalEl);

function setDefaultDataDisplayed() {
  var mainSelector = document.querySelector("#callerInformation");
  mainSelector.removeAttribute("callId");
  mainSelector.querySelector(".phoneNumber").innerHTML = "";
  mainSelector.querySelector(".callerName").innerHTML = "";
  mainSelector.querySelector(".callerAddress").innerHTML = "";
  mainSelector.querySelector(".callTime").innerHTML = "";
  mainSelector.querySelector(".callCoordinates").innerHTML = "";
  mainSelector.querySelector(".distance").innerHTML = "";
  mainSelector.querySelector(".callLocation").innerHTML = "";
  mainSelector.querySelector(".ett").innerHTML = "";
  mainSelector.querySelector(".ettt").innerHTML = "";
  trackBtn.innerHTML = "Track";
}

trackBtn.addEventListener("click", function(event) {
  var callId = document.querySelector("#callerInformation").getAttribute("callId");
  if (trackBtn.innerHTML === "Track") {
      if (!callId) {
        alert("Please click a marker to track.");
        return;
      }
      var callLog = callLogs[callId];
      var [lat, lng] = callLog.coordinates.split(',');
      var position = { lat: parseFloat(lat), lng: parseFloat(lng) }
      var renderer = calculateAndDisplayRoute(position, callId);
      renderers[callId] = renderer;
      trackBtn.innerHTML = "Untrack";
  }
  else {
    renderers[callId].setMap(null);
    trackBtn.innerHTML = "Track";
  }

});

document.querySelectorAll("button.statusBtn").forEach((btn) => {
  btn.addEventListener("click", function(evt){
    var callId = document.querySelector("#callerInformation").getAttribute("callId");
    if (!callId) {
      alert("Please click a marker to change status.");
      return;
    }
    var status = evt.target.getAttribute("data-status");
    if (status === "Responded") {
      statusModalLabel.innerHTML = "Respond Call";
      statusModalBody.innerHTML = "Are you sure that the team responded this call?";
    }
    else if (status == "Canceled") {
      statusModalLabel.innerHTML = "Cancel Call";
      statusModalBody.innerHTML = "Are you sure you want to cancel this call?";
    }
    document.querySelector("#confirmStatusBtn").setAttribute("data-status", status);
    statusModal.toggle();
  });
  
})

document.querySelector("#confirmStatusBtn").addEventListener("click", function(evt) {
  var callId = document.querySelector("#callerInformation").getAttribute("callId");
  if (!callId) {
    alert("Please click a marker to change status.");
    return;
  }
  var status = evt.target.getAttribute("data-status")
  fetch("http://127.0.0.1:8000/changestatus/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "callId": parseInt(callId),
      "status": status
    })
  })
  .then(resp => resp.json())
  .then(data => {
    setDefaultDataDisplayed();
    statusModal.toggle();
    markers[callId].setMap(null);
    delete markers[callId];
  })
  .catch(err => {
    console.log(err)
    alert("There was a problem in changing the status of the call.");
  })
});

function addItemToTable(item) {
  var tr = document.createElement("tr")
  var numberTr = document.createElement("td")
  numberTr.innerHTML = item.number;
  var dateTr = document.createElement("td");
  dateTr.innerHTML = document.innerHTML = item.date;
  var durationTr = document.createElement("td");
  durationTr.innerHTML = item.duration;
  var coordinatesTr = document.createElement("td");
  coordinatesTr.innerHTML = item.coordinates;
  var statusTr = document.createElement("td");
  statusTr.innerHTML = item.status;
  tr.appendChild(numberTr);
  tr.appendChild(dateTr);
  tr.appendChild(durationTr);
  tr.appendChild(coordinatesTr);
  tr.appendChild(statusTr);
  document.querySelector(".callLogsTable").appendChild(tr);
}

function getLiveCalls() {
  fetch("http://127.0.0.1:8000/live/")
  .then(resp => resp.json())
  .then(data => {
    data.recent_not_responded_logs.forEach(item => {
      if (!markers.hasOwnProperty(item.id)) {
        var [lat, lng] = item.coordinates.split(',');
        var position = { lat: parseFloat(lat), lng: parseFloat(lng) };
        map.setCenter(new google.maps.LatLng(position.lat, position.lng));
        markers[item.id] = addMarker(map, item, position, false);
        // addItemToTable(item);
      }
      callLogs[item.id] = item;
      
    });
  })
}



function calculateAndDisplayRoute(destination, markerId) {
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
  directionsService.route(
    {
      origin: new google.maps.LatLng(departmentPosition.lat, departmentPosition.lng),
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: "bestguess"
      }
    },
    function (response, status) {
      if (status === "OK") {
        var distance = response.routes[0].legs[0].distance.text;
        var duration = response.routes[0].legs[0].duration.text;
        var duration_in_traffic = response.routes[0].legs[0].duration_in_traffic.text;
        var destination_address = response.routes[0].legs[0].end_address;
        var mainSelector = document.querySelector("#callerInformation");
        mainSelector.querySelector(".distance").innerHTML = distance;
        mainSelector.querySelector(".callLocation").innerHTML = destination_address;
        mainSelector.querySelector(".ett").innerHTML = duration;
        mainSelector.querySelector(".ettt").innerHTML = duration_in_traffic;
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
  return directionsRenderer;
}



function addMarker(map, item, position, isDepartment) {
  // const contentString = document.querySelector("div.markerInfoWindow").outerHTML.replace("[callId]", item.id).replace("[coordinates]", item.coordinates).replace(/\[phone\]/g, item.number).replace(/\[calltime\]/g, item.date).replace(/\[callername\]/g, item.user.full_name).replace(/\[calleraddress\]/g, item.user.address);
  var marker = null;
  if (!isDepartment) {
    var image = new google.maps.MarkerImage(
      'http://127.0.0.1:8000/static/images/reddot.png',
      null,
      null,
      new google.maps.Point( 8, 8 ),
      new google.maps.Size( 17, 17 )
    );
    marker = new google.maps.Marker({
      flat: true,
      icon: image,
      optimized: false,
      position: position,
      map,
      title: "Emergency Location"
    });
    // const infowindow = new google.maps.InfoWindow({
    //   content: contentString,
    // });
    marker.addListener("click", () => {
      setDefaultDataDisplayed();
      var mainSelector = document.querySelector("#callerInformation");
      mainSelector.setAttribute("callId", item.id);
      mainSelector.querySelector(".phoneNumber").innerHTML = item.number;
      if (item.user) {
        mainSelector.querySelector(".callerName").innerHTML = item.user.full_name;
        mainSelector.querySelector(".callerAddress").innerHTML = item.user.address;
      }
      mainSelector.querySelector(".callTime").innerHTML = item.date;
      mainSelector.querySelector(".callCoordinates").innerHTML = item.coordinates;
      var tempRenderer = renderers[item.id];
      if (tempRenderer) {
        trackBtn.innerHTML = "Untrack";
      }
      // infowindow.open({
      //   anchor: marker,
      //   map,
      // });
    })
  }
  else {
    var image = new google.maps.MarkerImage(
      'http://127.0.0.1:8000/static/images/department.png',
      null,
      null,
      new google.maps.Point( 8, 8 ),
      new google.maps.Size( 30, 30 )
    );
    marker = new google.maps.Marker({
      flat: true,
      icon: image,
      optimized: false,
      position: position,
      map,
      title: "Department Location"
    });
  }
  return marker;
}

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  directionsService = new google.maps.DirectionsService();
  map = new Map(document.getElementById("map"), {
    zoom: 15,
    center: departmentPosition,
    mapId: "DEMO_MAP_ID",
  });

  addMarker(map, -1, departmentPosition, true)
}

initMap();
setInterval(getLiveCalls, 3000)


