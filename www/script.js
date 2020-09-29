let lastProcessedSecond = -1;
let lastProcessedDay    = "";
function clockUpdate() {
  let now = new Date();

  let s = now.getSeconds().toString().padStart(2, "0")
  if (s == lastProcessedSecond) {
    return
  } else {
    lastProcessedSecond = s;
  }
  let m = now.getMinutes().toString().padStart(2, "0")
  let h = now.getHours().toString().padStart(2, "0")
  $("#clock-h").text(h);
  $("#clock-m").text(m);
  $("#clock-s").text(s);
  if (parseInt(s)%2 == 1) {
    $("#clock-colon-s, #clock-colon-m").addClass("transparent")
  } else {
    $("#clock-colon-s, #clock-colon-m").removeClass("transparent")
  }

  let day = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][now.getDay()]
  if (day == lastProcessedDay) {
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

setInterval(clockUpdate, 200)
