/*
	These are hacks for validating values from the Google API. Reason:
		- start end dates return: obj.start.date if no time is set
								  obj.start.dateTime if a time is set

	  	- location is not present if it is left off of the event

	  	By default these will return 'N/A' if not applicable for now.
*/

// Return val if defined, otherwise return passed in default value or 'N/A'
function validateValue(val, defVal="") {return ((typeof(val) !== 'undefined') ? val : defVal)}

// Choose either date or dateTime
function chooseDate(date, dateTime) {return ((typeof(date) !== 'undefined') ? date : dateTime)}

// Simple function to split location address and return only
// the name.
function sliceLocation(location) {
	let name = location.split(',');
	return name[0];
}

function getEventTime(fullDate) {
	// Slices time and converts to am/pm;
	var time = fullDate.slice(11,16);
	var hr = parseInt(time.slice(0,2));
	var rest = time.slice(2);
	var suffix = (hr >= 12) ? 'pm' : 'am';
	hr = ((hr + 11) % 12 + 1);
	return (hr + rest + suffix);
}

function stringifyTime(startTime, endTime) {
	let start = ((startTime.length > 10) ? getEventTime(startTime) : ''); 
	let end = ((endTime.length > 10) ? getEventTime(endTime) : '');
	return (start === '' || end === '') ? '' : `${start} - ${end}` ;
}

exports.processEvents = function(res) {
	let events = res.data.items;
	let monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	let allEvents = [];

		events.map((e) => {
			let cLoc = validateValue(e.location);
			let cLocTitle = sliceLocation(cLoc);
			let cStart = chooseDate(e.start.date, e.start.dateTime);
			let cEnd = chooseDate(e.end.date, e.end.dateTime);

			let cMonth = monthAbbr[((cStart) => { return parseInt(cStart.slice(5,7)) })(cStart) - 1];
			let cDay = ((cStart) => { return parseInt(cStart.slice(8,10)) })(cStart);
			let cTime = stringifyTime(cStart, cEnd);
			let cLLink = (() => { return ((cLoc !== "N/A") ? ["https://www.google.com/maps/search", cLoc.replace(/ /g, "+")].join('/') : '#')})(cLoc);
			let cELink = e.htmlLink;
			let cDesc = validateValue(e.description);
			let cSum = validateValue(e.summary);
			let currentEvent = {
				'title': cELink,
				'month': cMonth,
				'day': cDay,
				'time': cTime,
				'location': {
					'title': cLocTitle,
					'link': cLLink
				},
				'desc': cDesc,
				'summary': cSum
			};
			allEvents.push(currentEvent);
		});

		return allEvents;
};

// exports.getCalendar = function() {
// 	let urlString = 'https://www.googleapis.com/calendar/v3/calendars/' + config.client.calendar.name + '/events?key=' + config.client.calendar.key + '&timeMin=' + new Date().toISOString() + '&maxResults=7&singleEvents=true&orderBy=startTime';
// 	//let currPage = window.location.href.split('/').pop();
// 	$.ajax({
// 		url: urlString,
// 		type: "GET",
// 		dataType: "json",
// 		success: function(response) {
// 			processEvents(response);
// 		}
// 	});
// };