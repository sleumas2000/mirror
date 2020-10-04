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
const emptyPromise = new Promise((r) => r({}))
function stagecoachApiQuery() {
  let homeBusesSchedulePromise = fetch("https://api.stagecoachbus.com/tis/v3/stop-event-query", {
    "headers": headers,
    "body": JSON.stringify({
      Stops: {
        StopLabel:["4200F205801","4200F205901","4200F206801"] // Tachbrook St (S), Brunswick Inn (N), Cashmore Ave (N)
      },
      Departure: {
        TargetDepartureTime: {
          value: new Date().toISOString()
        },
        EarliestDepartureLeeway: "PT0M",
        LatestDepartureLeeway: "PT360M"
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
    "body": JSON.stringify({
      Stops: {
        StopLabel:["4200F226401"] // Church
      },
      Departure: {
        TargetDepartureTime: {
          value: new Date().toISOString()
        },
        EarliestDepartureLeeway: "PT5M",
        LatestDepartureLeeway: "PT360M"
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
            servicesFilters: {servicesFilter: [{filter: "U2"},{filter: "U3"}]}
          },{
            stopPointLabel: "4200F205901", // Brunswick Inn (N)
            servicesFilters: {servicesFilter: [{filter: "1"}]}
          },{
            stopPointLabel: "4200F206801", // Cashmore (N)
            servicesFilters: {servicesFilter: [{filter: "U1A"},{filter: "U1"}/*,{filter: "U2"},{filter: "U3"}*/]}
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
            servicesFilters: {servicesFilter: [{filter: "U1A"},{filter: "U1"},{filter: "U2"},{filter: "U3"},{filter:"X17"},{filter:"X18"},{filter:"1"}]}
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
function stagecoachBusTimetableQuery(route, direction, time, stopCode) {
  return new Promise((r) => r({})); // TODO: Work out why my buses don't exist
  fetch("https://api.stagecoachbus.com/adc/estimated-timetable",{
    "headers": headers,
    "body": JSON.stringify({
      EstimatedTimetableRequest: {
        header: {
          retailOperation: "",
          channel: "",
          ipAddress: ""
        },
        service: route,
        direction: direction.toUpperCase(),
        originDepartureTime: time,
        originStopPointLabel: stopCode
      }
    }),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => response.json());
}
