var container;
var camera;
var scene;
var geometry;
var material;
var spherMesh;
var renderer;
var controls;
var radius = 200;
var latitudeDegreeOffset = 90;
var longitudeDegreeOffset = 0;
var markers = [];
var tempOfset = 273.15;
 
setup();
onLoad();
function setup()
{
    container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 700;
 
    scene = new THREE.Scene();
    geometry = new THREE.SphereGeometry(radius, 30, 30);
    material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("earth_8k.jpg")
        
    });
    spherMesh = new THREE.Mesh(geometry, material);
    spherMesh.overdraw = true;
    spherMesh.rotation.y = 60;
    scene.add(spherMesh);
 
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
 
    controls = new THREE.OrbitControls(camera, renderer.domElement);
 
    renderer.setSize( window.innerWidth, window.innerHeight );


    var pointer = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 0, 10),
      new THREE.MeshPhongMaterial({color: 0xcc9900}));
    pointer.position.set(55, 0, 0); // rotating obj should set (X > 0, 0, 0)
    pointer.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
    var marker = new THREE.Object3D();
    marker.add(pointer);
    
    var obj = new THREE.Object3D();
    obj.add(marker);
    
    scene.add(obj);
    var rad = Math.PI / 180;
    marker.quaternion.setFromEuler(
    new THREE.Euler(0, 135 * rad, 45 * rad, "YZX")); 
    //position utilisateur
    navigator.geolocation.watchPosition(function (pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude;
      marker.quaternion.setFromEuler(
          new THREE.Euler(0, lon * rad, lat * rad, "YZX")); 
    });
 
    render();

   
}
 
function render()
{
    requestAnimationFrame(render);
    spherMesh.rotation.y -= 0.001;
    controls.update();
    renderer.render(scene, camera);
}
 
//
function translateGeoCoords( latitude, longitude, radius )
{
    latitude = Math.PI * latitude / 180;
    longitude = Math.PI * longitude / 180;
 
    latitude -= ( latitudeDegreeOffset * ( Math.PI / 180 )); // offset latitude by n degrees (in radians).
    longitude -= ( longitudeDegreeOffset * ( Math.PI / 180 )); // offset longitude by n degrees (in radians).
 
    var x = radius * Math.sin( latitude ) * Math.cos( longitude );
    var y = radius * Math.sin( latitude ) * Math.sin( longitude );
    var z = radius * Math.cos( latitude );
 
    return new THREE.Vector3( -x, z, y ); 
}
function onLoad()
{

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition);
  } else { 
    x.innerHTML = "Geolocation n'est pas supporter";
  }
  
}
function showPosition(position) {
   var lat = position.coords.latitude;
  var lon = position.coords.longitude;
console.log(lat,lon);
  apiRequest(lat, lon);
}
//
function onClick()
{
  var lat = form1.field1.value;
  var lon = form1.field2.value;
 
  // test

  apiRequest(lat, lon);
  
   //
    navigator.geolocation.getCurrentPosition(function(location) {
  var latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);

  var layer = new L.StamenTileLayer("terrain");
var map = new L.Map("macarte2", {
    center: new L.LatLng(location.coords.latitude, location.coords.longitude),
    zoom: 5
});
map.addLayer(layer);
var latlngs = [[32.296762, -64.790501],[27.101416, -80.900932],[17.947276, -66.353661]];
var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);
  
var marker = L.marker(latlng).addTo(map);
      var circle = L.circle(marker.getLatLng(),location.coords.accuracy).addTo(map);
      
      var marker2 = L.marker([ lat, lon]).addTo(map);
      var ligne = L.polyline([]).addTo(map);
    
        var start = marker.getLatLng();
        var end = marker2.getLatLng();
        console.log(end);
        distance = Math.round(start.distanceTo(end) / 1000.0);
        marker.bindPopup('La distance entre ta position et  '+cityname +' '+distance+' km');
        marker.openPopup();
        console.log(distance);
        ligne.setLatLngs([marker.getLatLng(), marker2.getLatLng()]);
        
       
      });
}
 
function onClear()
{
  for (var i = 0; i < markers.length; i++) {
    spherMesh.remove(markers[i]);
    markers[i].geometry.dispose();
    markers[i].material.dispose();
    markers[i] = null;
  }
 
  markers = [];
  form1.field3.value = "";
}
 
//
function addMarker(lat, lon, col)
{
  if(isNaN(lat) || isNaN(lon))
  {
    alert("Attention")
    return;
  }
 
  var vec3 = translateGeoCoords(lat, lon, radius);
  var geo = new THREE.BoxGeometry(3,3,30);
  var mat = new THREE.MeshBasicMaterial({color:col});
  markers.push(new THREE.Mesh(geo, mat));
  markers[markers.length-1].position.set(vec3.x, vec3.y, vec3.z);
  spherMesh.add(markers[markers.length-1]);
 
  markers[markers.length-1].lookAt(spherMesh.position);

  

}

 
/**
* OpenWeatheMap API
**/
function getOpenWeatheMapQueri(lat, lon)
{
  var api = "https://api.openweathermap.org/data/2.5/weather";
  var queri = api + "?lat=" + lat + "&lon=" + lon + "&appid=d976d836a93f588b00a40de7f44184eb";
  return queri;
}
 var cityname = null;
// OpenWeatheMap API 
function apiRequest(lat, lon)
{
  var httpObj = new XMLHttpRequest();
  httpObj.open("get", getOpenWeatheMapQueri(lat, lon), true);
 
  // onload ハンドラ
  httpObj.onload = function(){
    var json = JSON.parse(this.responseText);
    console.log(json);
 
    var weather = json.weather[0].main;
    var temp = new Number(json.main.temp);
    temp -= tempOfset;
 cityname =json.name;
    form1.field3.value = json.name + "  |  Meteo : " + weather + "  |  Temperature : " + temp.toFixed(1) + "°C  Humidite : " + json.main.humidity + "%";
 
    //
    var col;
    switch (weather)
    {
      case "Clear":
        col = 0xFF9900;
        break;
      case "Clouds":
        col = 0x607D8B;
        break;
      case "Rain":
        col = 0x0D47A1;
        break;
      case "Snow":
        col = 0xEEEEEE;
        break;
      default:
        col = 0xf44336;
    }
    addMarker(lat, lon, col);
  }
  httpObj.send(null);
}
 
//
window.addEventListener('resize', function()
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}, false );

//Leaflet MAP
function main() {

  var options = {
    center: [40.420488, -3.705878],
    zoom: 12
  }
  
  var map = L.map('map', options);

  map.on('click', 
    function(e){
      var coord = e.latlng.toString().split(',');
      var lat = coord[0].split('(');
      var lng = coord[1].split(')');
      console.log("You clicked the map at latitude: " + lat[1] + " and longitude:" + lng[0]);
    });
}
window.onload = main;