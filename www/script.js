
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
let localBuses = [];

function getBuses() {
  return new Promise(function(resolve) {
    resolve([{title:"Do the thing",status:"todo",}])
  }).then(function(busTimes){
    localBuses = busTimes;
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

let selection = {section: "bus", index: 0};

// Redraw function

function redrawUI(section = "all") {
  if (section === "selected") section = selection.section;
  // Redraw buses section

  // Redraw events section

  // Redraw tasks section

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
  console.log(key)
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
