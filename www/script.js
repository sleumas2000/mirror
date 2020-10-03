
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
    if (homeBusesMonitor.stopMonitors.stopMonitor) {
      [tachbrookBuses, brunswickBuses, cashmoreBuses] = homeBusesMonitor.stopMonitors.stopMonitor.map((monitor)=>monitor.monitoredCalls.monitoredCall)
    } else {
      [tachbrookBuses, brunswickBuses, cashmoreBuses] = [[],[],[]]
    }
    if (churchBusesMonitor.stopMonitors.stopMonitor) {
      churchBuses = churchBusesMonitor.stopMonitors.stopMonitor[0].monitoredCalls.monitoredCall
    } else {
      churchBuses = []
    }
    localBuses = {home:[],church:[]};
    for (bus of [tachbrookBuses,brunswickBuses,cashmoreBuses].flat()) {
      if (bus.cancelled) continue;
      localBuses.home.push({route:bus.lineRef,time:new Date(bus.expectedArrivalTime),destination:bus.destinationDisplay});
    }
    for (bus of churchBuses) {
      if (bus.cancelled) continue;
      localBuses.church.push({route:bus.lineRef,time:new Date(bus.expectedArrivalTime),destination:bus.destinationDisplay});
    }
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

let selection = {section: "bus", index: {x: 0, y: 0}};
let busColumn = "both"

// Redraw function

function redrawUI(section = "all") {
  if (section === "selected") section = selection.section;
  // Redraw buses section
  if (section === "all" || section === "buses") {
    $('#bus-list-home, #bus-list-church').empty();
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
      if (busColumn == "both") {bus.destination = ""}
      $('#bus-list-home').append($('<li>').addClass('bus').html(`
      <div class="bus-route route-${bus.route}">${bus.route}</div>
      <div class="bus-time">${h}:${m}<span class="bus-time-seconds">:${s}</span></div>
      <div class="bus-destination">${bus.destination}</div>
      <div class="bus-time-from-now">${timeFromNow}</div>`));
    }
    for (bus of localBuses.church) {
      console.log(bus);
      h = bus.time.getHours().toString().padStart(2, "0")
      m = bus.time.getMinutes().toString().padStart(2, "0")
      s = bus.time.getSeconds().toString().padStart(2, "0")
      timeFromNow = bus.time - new Date()
      if (timeFromNow < 0) {
        timeFromNow = "Departed"
      } else if (timeFromNow < 60000){
        timeFromNow = "Due"
      } else {
        timeFromNow = math.floor(timeFromNow / 60000)
        timeFromNow = timeFromNow.toString()+" mins"
      }
      if (busColumn == "both") {bus.destination = ""}
      $('#bus-list-church').append($('<li>').addClass('bus').html(`
      <div class="bus-route route-${bus.route}">${bus.route}</div>
      <div class="bus-time">${h}:${m}<span class="bus-time-seconds">:${s}</span></div>
      <div class="bus-destination">${bus.destination}</div>
      <div class="bus-time-from-now">${timeFromNow}</div>`));
    }
    if (localBuses.home.length === 0) {
      $('#bus-list-home').append($('<li>').addClass('bus-list-no-buses').text("No buses"))
    } else {
      $('#bus-list-home').append($('<li>').addClass('bus-list-end').text("End"))
    }
    if (localBuses.church.length === 0) {
      $('#bus-list-church').append($('<li>').addClass('bus-list-no-buses').text("No buses"))
    } else {
      $('#bus-list-church').append($('<li>').addClass('bus-list-end').text("End"))
    }
  }
  // Redraw events section

  // Redraw tasks section

}

// Hooks

function everyMinute() {
  Promise.all([getTasks(),getEvents(),getBuses()]).then(function(){
    console.log("re-drawing");
    console.log(localBuses);
    redrawUI();
  },function (err){
    console.log(err);
  })
}

function onKeypressEvent(event) {
  let key = event.key;
  //console.log(key)
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
