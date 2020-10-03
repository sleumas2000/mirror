const headers = {
  "accept": "application/json, text/javascript, */*; q=0.01",
  "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
  "content-type": "application/json",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "X-SC-apiKey": "ukbusprodapi_7k8K536tNsPH#!",
  "X-SC-securityMethod": "API"
}
const emptyPromise = new Promise((r) => r(null))
function stagecoachApiQuery() {
  let homeBusesSchedulePromise = fetch("https://api.stagecoachbus.com/tis/v3/stop-event-query", {
    "headers": headers,
    "referrer": "https://www.stagecoachbus.com/bus-stop?busStop%5BGeocode%5D%5BGrid%5D%5Bvalue%5D=WGS84&busStop%5BGeocode%5D%5BLongitude%5D=-1.5291824890766799&busStop%5BGeocode%5D%5BLatitude%5D=52.278104801179374&busStop%5BName%5D=Leamington+Spa%2C+Tachbrook+Street&busStop%5BStopLabel%5D=4200F205801",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": JSON.stringify({
      Stops: {
        StopLabel:["4200F205801","4200F205901","4200F206801"] // Tachbrook St (S), Brunswick Inn (N), Cashmore Ave (N)
      },
      Departure: {
        TargetDepartureTime: {
          value: new Date().toISOString()
        },
        EarliestDepartureLeeway: "PT0M",
        LatestDepartureLeeway: "PT180M"
      },
      ResponseCharacteristics: {
        MaxLaterEvents: {
          value: 20
        },
        StopCoordinates: false,
        IncludeSituations: false,
        GenerateKML: false
      },
      RequestId: "bus-stop-query-stagecoach"
    }),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => response.json());
  let churchBusesSchedulePromise = fetch("https://api.stagecoachbus.com/tis/v3/stop-event-query", {
    "headers": headers,
    "referrer": "https://www.stagecoachbus.com/bus-stop?busStop%5BGeocode%5D%5BGrid%5D%5Bvalue%5D=WGS84&busStop%5BGeocode%5D%5BLongitude%5D=-1.5291824890766799&busStop%5BGeocode%5D%5BLatitude%5D=52.278104801179374&busStop%5BName%5D=Leamington+Spa%2C+Tachbrook+Street&busStop%5BStopLabel%5D=4200F205801",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": JSON.stringify({
      Stops: {
        StopLabel:["4200F226401"] // Church
      },
      Departure: {
        TargetDepartureTime: {
          value: new Date().toISOString()
        },
        EarliestDepartureLeeway: "PT5M",
        LatestDepartureLeeway: "PT180M"
      },
      ResponseCharacteristics: {
        MaxLaterEvents: {
          value: 20
        },
        StopCoordinates: false,
        IncludeSituations: false,
        GenerateKML: false
      },
      RequestId: "bus-stop-query-stagecoach"
    }),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => response.json());
  let homeBusesMonitorPromise = fetch("https://api.stagecoachbus.com/adc/stop-monitor", {
    "headers": headers,
    "referrer": "https://www.stagecoachbus.com/bus-stop?busStop%5BGeocode%5D%5BGrid%5D%5Bvalue%5D=WGS84&busStop%5BGeocode%5D%5BLongitude%5D=-1.5291824890766799&busStop%5BGeocode%5D%5BLatitude%5D=52.278104801179374&busStop%5BName%5D=Leamington+Spa%2C+Tachbrook+Street&busStop%5BStopLabel%5D=4200F205801",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": JSON.stringify({
      StopMonitorRequest: {
        header: {
          retailOperation: "",
          channel: "",
          ipAddress: ""
        },
        lookAheadMinutes: 60,
        stopMonitorQueries: {stopMonitorQuery: [
          {
            stopPointLabel: "4200F205801", // Tachbrook St (S)
            servicesFilters: {servicesFilter: [{filter: "1"},{filter: "U2"},{filter: "U3"}]}
          },{
            stopPointLabel: "4200F205901", // Brunswick Inn (N)
            servicesFilters: {servicesFilter: [{filter: "1"}]}
          },{
            stopPointLabel: "4200F206801", // Cashmore (N)
            servicesFilters: {servicesFilter: [{filter: "U1A"},{filter: "U1"},{filter: "U2"},{filter: "U3"}]}
          }
        ]}
      }
    }),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => response.json());
  let churchBusesMonitorPromise = fetch("https://api.stagecoachbus.com/adc/stop-monitor", {
    "headers": headers,
    "referrer": "https://www.stagecoachbus.com/bus-stop?busStop%5BGeocode%5D%5BGrid%5D%5Bvalue%5D=WGS84&busStop%5BGeocode%5D%5BLongitude%5D=-1.5291824890766799&busStop%5BGeocode%5D%5BLatitude%5D=52.278104801179374&busStop%5BName%5D=Leamington+Spa%2C+Tachbrook+Street&busStop%5BStopLabel%5D=4200F205801",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": JSON.stringify({
      StopMonitorRequest: {
        header: {
          retailOperation: "",
          channel: "",
          ipAddress: ""
        },
        lookAheadMinutes: 60,
        stopMonitorQueries: {stopMonitorQuery: [
          {
            stopPointLabel: "4200F226401", // Church
            servicesFilters: {servicesFilter: [{filter: "U1A"},{filter: "U1"},{filter: "U2"},{filter: "U3"},{filter:"X17"},{filter:"X18"}]}
          }
        ]}
      }
    }),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => response.json());
  return Promise.all([homeBusesSchedulePromise,churchBusesSchedulePromise,homeBusesMonitorPromise,churchBusesMonitorPromise])
}
