
// Clock update loop
let lastProcessedSecond  = -1;
let lastProcessedDay     = "";
let everyMinuteProcessed = false;
function updateClock() {
  let now = new Date();

  let s = now.getSeconds().toString().padStart(2, "0")

  // Check if this second has already been processed
  if (s === lastProcessedSecond) {
    return
  } else {
    lastProcessedSecond = s;
  }

  let m = now.getMinutes().toString().padStart(2, "0")
  let h = now.getHours().toString().padStart(2, "0")
  $("#clock-h").text(h);
  $("#clock-m").text(m);
  $("#clock-s").text(s);
  if (parseInt(s)%2 === 1) {
    $("#clock-colon-s, #clock-colon-m").addClass("transparent")
  } else {
    $("#clock-colon-s, #clock-colon-m").removeClass("transparent")
  }

  //Check if this minute has already been processed
  if (!everyMinuteProcessed && s === "00") {
    // Run the every minute update loop
    everyMinute();
    everyMinuteProcessed = true;
  } else if (s !== "00") {
    everyMinuteProcessed = false;
  }

  let day = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][now.getDay()]

  // Check if today has already been processed
  if (day === lastProcessedDay) {
    return
  } else {
    lastProcessedDay = day;
  }
  let date = now.getDate()
  let month = ["January","February","March","April","May","June","July","August","September","October","November","December"][now.getMonth()]
  let year  = now.getFullYear()
  $("#date-day").text(day)
  $("#date-date").text(date)
  $("#date-month").text(month)
  $("#date-year").text(year)
}

// Async update functions

let localTasks = [];
let localEvents = [];
let localBuses = {home:[],church:[]};

function getBuses() {
  return stagecoachApiQuery() // from stagecoach-api-query.js - returns Promise([Object Literal (4)])
  .then(function([homeBusesSchedule,churchBusesSchedule,homeBusesMonitor,churchBusesMonitor]) {
    console.log(homeBusesSchedule);
    console.log(churchBusesSchedule);
    console.log(homeBusesMonitor);
    console.log(churchBusesMonitor);
    localBuses = {home:[],church:[]};
    if (homeBusesSchedule.Events && homeBusesSchedule.Events.Event) {
      for (bus of homeBusesSchedule.Events.Event) {
        if (bus.StopLabel === "4200F205801" && bus.Trip.Service.ServiceNumber === "1") continue; // Ignore 1 to south farm from Tachbrook St stop
        localBuses.home.push({route:bus.Trip.Service.ServiceNumber,time:new Date(bus.ScheduledDepartureTime.value),destination:bus.Trip.DestinationBoard})
      }
    }
    if (churchBusesSchedule.Events && churchBusesSchedule.Events.Event) {
      for (bus of churchBusesSchedule.Events.Event) {
        localBuses.church.push({route:bus.Trip.Service.ServiceNumber,time:new Date(bus.ScheduledDepartureTime.value),destination:bus.Trip.DestinationBoard})
      }
    }
    if (homeBusesMonitor.stopMonitors && homeBusesMonitor.stopMonitors.stopMonitor) {
      homeLiveBuses = homeBusesMonitor.stopMonitors.stopMonitor.map((monitor) => (monitor.monitoredCalls && monitor.monitoredCalls.monitoredCall ? monitor.monitoredCalls.monitoredCall : [])).flat()
    } else homeLiveBuses = [];
    if (churchBusesMonitor.stopMonitors && churchBusesMonitor.stopMonitors.stopMonitor && churchBusesMonitor.stopMonitors.stopMonitor[0].monitoredCalls && churchBusesMonitor.stopMonitors.stopMonitor[0].monitoredCalls.monitoredCall) {
      churchLiveBuses = churchBusesMonitor.stopMonitors.stopMonitor[0].monitoredCalls.monitoredCall
    } else churchLiveBuses = [];
    for (liveBus of homeLiveBuses) {
      let scheduledDeparture = new Date(liveBus.aimedDepartureTime)
      let route = liveBus.lineRef
      for (scheduledBus of localBuses.home.filter((bus) => bus.route === route)) {
        if (Math.abs(scheduledDeparture - scheduledBus.time) < 60000) { // If the scheduled departures are within 1 minute
          scheduledBus.cancelled = liveBus.cancelled
          if (liveBus.expectedDepartureTime) {
            scheduledBus.time = new Date(liveBus.expectedDepartureTime)
            scheduledBus.live = true
          }
        }
      }
    }
    for (liveBus of churchLiveBuses) {
      let scheduledDeparture = new Date(liveBus.aimedDepartureTime)
      let route = liveBus.lineRef
      for (scheduledBus of localBuses.church.filter((bus) => bus.route === route)) {
        if (Math.abs(scheduledDeparture - scheduledBus.time) < 120000) { // If the scheduled departures are within 2 minutes
          scheduledBus.cancelled = liveBus.cancelled
          if (liveBus.expectedDepartureTime) {
            scheduledBus.time = new Date(liveBus.expectedDepartureTime)
            scheduledBus.live = true
          }
        }
      }
    }
    /*if (homeBusesMonitor.stopMonitors.stopMonitor) {
      [tachbrookBuses, brunswickBuses, cashmoreBuses] = homeBusesMonitor.stopMonitors.stopMonitor.map((monitor)=>monitor.monitoredCalls.monitoredCall)
    } else {
      [tachbrookBuses, brunswickBuses, cashmoreBuses] = [[],[],[]]
    }
    if (churchBusesMonitor.stopMonitors.stopMonitor) {
      churchBuses = churchBusesMonitor.stopMonitors.stopMonitor[0].monitoredCalls.monitoredCall
    } else {
      churchBuses = []
    }
    for (bus of [tachbrookBuses,brunswickBuses,cashmoreBuses].flat()) {
      if (bus.cancelled) continue;
      localBuses.home.push({route:bus.lineRef,time:new Date(bus.expectedArrivalTime),destination:bus.destinationDisplay});
    }
    for (bus of churchBuses) {
      if (bus.cancelled) continue;
      localBuses.church.push({route:bus.lineRef,time:new Date(bus.expectedArrivalTime),destination:bus.destinationDisplay});
    }*/
    //console.log(tachbrookBuses);
    //localBuses = busTimes;
    //localBuses = {home:[{route:"U1A",time:new Date("2020-09-30T04:00Z"),destination:"Uni"}],church:[{route:"X17",time:new Date("2020-09-30T04:00Z"),destination:"Cov"}]}
  });
}
function getEvents() {
  return new Promise(function(resolve) {
    resolve([{title:"Be at the place",start:new Date("2020-09-30T04:00Z"),end:new Date("2020-09-30T04:30Z"),location:"Campus"}])
  }).then(function(remoteEvents){
    remoteEvents.sort(function(a,b){
      return a.start.getTime()-b.start.getTime()
    });
    localEvents = remoteEvents;
  });
}
function getTasks() {
  return new Promise(function(resolve) {
    resolve([{title:"Do the thing",status:"todo",}])
  }).then(function(remoteTasks){
    localTasks = remoteTasks;
  });
}

// UI Logic:

let selection = {section: "buses", index: {x: 0, y: 0}};
let focus     = {section: "none", fullScreen: false}
let isHidden  = {buses: false, events: false, tasks: false}
let busColumn = "both"

function focusSection(section) {
  if (isHidden[section]) {
    $('#'+section).removeClass('is-hidden');
    $('#buses, #events, #tasks').removeClass('is-full-screen');
    isHidden[section] = false;
    focus.fullScreen = false;
  } else if (focus.fullScreen && section != focus.section) {
    $('#buses, #events, #tasks').removeClass('is-full-screen');
    $('#'+focus.section).addClass('is-focused')
    focus.fullScreen = false;
  } else if (focus.section != section) {
    $('#buses, #events, #tasks').removeClass('is-focused').removeClass('is-full-screen');
    $('#'+section).removeClass("is-hidden").addClass("is-focused")
    focus = {section: section, fullScreen: false}
  } else {
    $('#buses, #events, #tasks').removeClass("is-focused")
    $('#'+section).removeClass("is-hidden").addClass('is-full-screen')
    focus.fullScreen = true;
  }
}
function defocusSection(section) {
  if (section !== focus.section) {
    $('#'+section).addClass('is-hidden').removeClass('is-full-screen').removeClass('is-focused');
    isHidden[section] = true;
  } else if (focus.fullScreen){
    $('#'+section).removeClass('is-full-screen').addClass('is-focused');
    focus.fullScreen = false;
  } else if (!focus.fullScreen) {
    $('#'+section).removeClass('is-full-screen').removeClass('is-focused')
    focus = {section: "none", fullScreen: false}
  }

}

// Redraw functions

function redrawBuses() {
  busListHome = $('#bus-list-home')
  busListChurch = $('#bus-list-church')
  busListHome.empty();
  for (bus of localBuses.home) {
    h = bus.time.getHours().toString().padStart(2, "0")
    m = bus.time.getMinutes().toString().padStart(2, "0")
    s = bus.time.getSeconds().toString().padStart(2, "0")
    timeFromNow = bus.time - new Date()
    if (timeFromNow < 0) {
      timeFromNow = "Departed"
    } else if (timeFromNow < 60000){
      timeFromNow = "Due"
    } else {
      timeFromNow = Math.floor(timeFromNow / 60000)
      timeFromNow = timeFromNow.toString()+" mins"
    }
    busListHome.append($('<li>').addClass('bus').html(`
    <div class="bus-route route-${bus.route}">${bus.route}</div>
    <div class="bus-time${bus.live? " bus-time-live" : " bus-time-scheduled"}">${h}:${m}<span class="bus-time-seconds">:${s}</span></div>
    <div class="bus-destination${busColumn !== "home" ? " is-hidden" : ""}">${bus.destination}</div>
    <div class="bus-time-from-now">${bus.live?timeFromNow:""}</div>`));
  }
  busListChurch.empty();
  for (bus of localBuses.church) {
    h = bus.time.getHours().toString().padStart(2, "0")
    m = bus.time.getMinutes().toString().padStart(2, "0")
    s = bus.time.getSeconds().toString().padStart(2, "0")
    timeFromNow = bus.time - new Date()
    if (timeFromNow < 0) {
      timeFromNow = "Departed"
    } else if (timeFromNow < 60000){
      timeFromNow = "Due"
    } else {
      timeFromNow = Math.floor(timeFromNow / 60000)
      timeFromNow = timeFromNow.toString()+" mins"
    }
    busListChurch.append($('<li>').addClass('bus').html(`
    <div class="bus-route route-${bus.route}">${bus.route}</div>
    <div class="bus-time${bus.live? " bus-time-live" : " bus-time-scheduled"}">${h}:${m}<span class="bus-time-seconds">:${s}</span></div>
    <div class="bus-destination${busColumn !== "church" ? " is-hidden" : ""}">${bus.destination}</div>
    <div class="bus-time-from-now">${bus.live?timeFromNow:""}</div>`));
  }
  if (localBuses.home.length === 0) {
    busListHome.append($('<li>').addClass('bus-list-no-buses').text("No buses"))
  } else {
    busListHome.append($('<li>').addClass('bus-list-end').text("End"))
  }
  if (localBuses.church.length === 0) {
    busListChurch.append($('<li>').addClass('bus-list-no-buses').text("No buses"))
  } else {
    busListChurch.append($('<li>').addClass('bus-list-end').text("End"))
  }
}

function redrawEvents() {

}

function redrawTasks() {

}

function redrawUI(section = "all") {
  if (section === "selected") section = selection.section;
  if (section === "all" || section === "buses") {
    redrawBuses()
  }
  if (section === "all" || section === "events") {
    redrawEvents()
  }
  if (section === "all" || section === "tasks") {
    redrawTasks()
  }

}

// Hooks

function everyMinute() {
  Promise.all([getTasks(),getEvents(),getBuses()]).then(function(){
    redrawUI();
  },function (err){
    console.log(err);
  })
}

function onKeypressEvent(event) {
  let key = event.key;
  console.log(key);
  // Global keys

  if (key === "-") {
    defocusSection(selection.section);
    return;
  } else if (key === "+") {
    focusSection(selection.section);
    return;
  } else

  // Selection keys

  if (key === "7" || key === "Home") {
    selection = {section: "buses", index: {x: 0, y: 0}};
    if (isHidden["buses"] || focus.fullScreen) focusSection("buses");
    return;
  } else if (key === "9" || key === "PageUp") {
    selection = {section: "events", index: {x: 0, y: 0}};
    if (isHidden["events"] || focus.fullScreen) focusSection("events");
    return;
  } else if (key === "3" || key === "PageDn") {
    selection = {section: "tasks", index: {x: 0, y: 0}};
    if (isHidden["tasks"] || focus.fullScreen) focusSection("tasks");
    return;
  } else
  // Buses
  if (selection.section === "buses") {
    if (key === "6" || key === "ArrowRight") {
      if (busColumn === "both") {
        $('#bus-column-church').addClass("is-hidden")
        busColumn = "home"
      } else if (busColumn === "church") {
        $('#bus-column-home').removeClass("is-hidden")
        busColumn = "both"
      }
    } else if (key === "4" || key === "ArrowLeft") {
      if (busColumn === "both") {
        $('#bus-column-home').addClass("is-hidden")
        busColumn = "church"
      } else if (busColumn === "home") {
        $('#bus-column-church').removeClass("is-hidden")
        busColumn = "both"
      }
    }
  }
  redrawUI();
}

// On page load
function onLoad() {
  // Keep the clock up to date
  updateClock()
  setInterval(updateClock, 200)
  // Run the every minute script to initialise the screen
  everyMinute();
  // Start listening for input
  $(document).on("keydown", null, null, onKeypressEvent)
}

// Start
onLoad()
