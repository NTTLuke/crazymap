import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import AddMarker from "./AddMarker";
import markerImg from "../utils/img/285659_marker_map_icon.svg";
import markerImgGreen from "../utils/img/285659_marker_map_icon_green.svg";
import L from "leaflet";

function MapView(props) {
  return (
    <MapContainer
      center={[44.33956524809713, 10.986328125000002]}
      zoom={4}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <AddMarker
        setLocation={props.setLocation}
        setMarkerLocations={props.setMarkerLocations}
        updatingLocation={props.updatingLocation}
        account={props.account}
        markerLocations={props.markerLocations}
      ></AddMarker>
      {Object.entries(props.markerLocations).map((e, i) => {
        let img = markerImg;
        if (e[1].isMainAccount) img = markerImgGreen;

        var myIcon = L.icon({
          iconUrl: img,
          iconSize: [48, 48],
          iconAnchor: [30, 30],
          popupAnchor: [-5, -23],
          shadowSize: [48, 48],
          shadowAnchor: [48, 48],
        });
        return (
          <Marker key={i} icon={myIcon} position={e[1].location}>
            <Popup>
              <div>{e[1].discordName}</div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MapView;
