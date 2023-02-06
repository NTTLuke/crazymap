import { useEffect, useState } from "react";
import { Marker, Popup, useMapEvent } from "react-leaflet";
import markerImg from "../utils/img/285659_marker_map_icon_green.svg";
import L from "leaflet";
import "./AddMarker.scss";

function AddMarker(props) {
  const [marker, setMarker] = useState();
  const [discordName, setDiscordName] = useState("");
  const [mainAccount, setMainAccount] = useState();
  var myIcon = L.icon({
    iconUrl: markerImg,
    iconSize: [48, 48],
    iconAnchor: [30, 30],
    className: props.updatingLocation && "updating",
    popupAnchor: [-5, -23],
    shadowSize: [48, 48],
    shadowAnchor: [48, 48],
  });

  useMapEvent("dblclick", (e) => {
    if (!props.updatingLocation) {
      setMarker(e.latlng);
      let newMarkerLocations = {};
      Object.entries(props.markerLocations).map((e) => {
        if (!e[1].isMainAccount) {
          newMarkerLocations = { ...newMarkerLocations, [e[0]]: e[1] };
        } else {
          setMainAccount(e[1]);
        }
      });
      props.setMarkerLocations(newMarkerLocations);
    }
  });

  useEffect(() => {
    if (
      props.markerLocations &&
      Object.keys(props.markerLocations).length > 0
    ) {
      Object.entries(props.markerLocations).map((e) => {
        if (e[1].isMainAccount) {
          setMainAccount(e[1]);
        }
      });
    }
  }, [props.markerLocations]);

  return marker ? (
    <Marker icon={myIcon} position={marker}>
      <Popup>
        <div className="setLocation">
          <div>
            {!mainAccount || (mainAccount && !mainAccount.discordName) ? (
              <input
                placeholder="Discord Name"
                className="discordNameInput"
                onChange={(e) => setDiscordName(e.target.value)}
              ></input>
            ) : (
              <div style={{ fontWeight: "700", marginLeft: "5px" }}>
                {mainAccount.discordName}
              </div>
            )}
          </div>
          <button
            className="btn"
            disabled={props.updatingLocation}
            onClick={() => {
              props.setLocation(discordName || mainAccount.discordName, marker);
            }}
          >
            {props.updatingLocation
              ? "Updating"
              : mainAccount && mainAccount.discordName
              ? "Update Location"
              : "Save"}
          </button>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default AddMarker;
