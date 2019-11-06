onStartup();

setInterval(function() {
	getDate();
}, 100);

setInterval(function() {
	onStartup();
}, 1800000);

function onStartup() {
	document.getElementById("LUString").innerHTML = "Updating right now..."
	document.getElementById("deets").innerHTML = "checking saved information...";
	if (!localStorage.getItem("lat") | !localStorage.getItem("lon") | !localStorage.getItem("units") | !localStorage.getItem("country")) {getLocationPerm(); return;}
	if (!localStorage.getItem("wMethod")) {localStorage.setItem("wMethod", "widget");}
	if (localStorage.getItem("wMethod") === "widget") {embedWidget();}
	if (localStorage.getItem("wMethod") === "wbit" | localStorage.getItem("wMethod") === "api") {getAlerts();}
	if (localStorage.getItem("wMethod") === "owea") {getWeatherA();}
	document.getElementById("deets").innerHTML = "getting weather information...";
	if (localStorage.getItem("units") === "I") {document.getElementById("dg").innerHTML = "°F"} 
	if (localStorage.getItem("units") === "S") {document.getElementById("dg").innerHTML = " K"} 
	if (localStorage.getItem("units") === "M") {document.getElementById("dg").innerHTML = "°C"} 
	applySettings();
	update();
}

function getLocationPerm() {
	document.getElementById("settings").style.display = "none"
	document.getElementById("loader").style.display = 'none';
	document.getElementById("kelvinErr").style.display = 'none';
	document.getElementById("locationRequest").style.display = 'block';
}

function getLocation() {
	localStorage.setItem("units", document.getElementById("units").value);
	document.getElementById("showUnits").style.display = 'none';
	document.getElementById("locLoad").style.display = '';
	if (navigator.geolocation) {
		document.getElementById("deets").innerHTML = "awaiting your location..."
		navigator.geolocation.getCurrentPosition(showPosition, showError);
	}
}

function showPosition(position) {
	localStorage.setItem("lat", position.coords.latitude);
	localStorage.setItem("lon", position.coords.longitude);
	document.getElementById("deets").innerHTML = "got location... parsing geocoding api (for local news)..."
	document.getElementById("countryCode").style.display = '';
	document.getElementById("locLoad").style.display = 'none';
	document.getElementById("deets").innerHTML = "please enter your country code! if you don't know, look <a href='https://www.countrycode.org/'>here</a>.";
}

function showError(error) {
	switch(error.code) {
    case error.PERMISSION_DENIED:
		document.getElementById("locationDenied").style.display = "";
		getLocation();
		break;
    case error.TIMEOUT:
		location.reload();
	}
}

function getAlerts() {
	document.getElementById("deets").innerHTML = "getting weather alert information...";
	document.getElementById("wProvider").innerHTML = "weatherbit.io";
	const http = new XMLHttpRequest();
	const dUrl = "https://api.weatherbit.io/v2.0/alerts?lat=" + localStorage.getItem("lat") + "&lon=" + localStorage.getItem("lon") + "&key=6789ff326aa04cffb89e0f89c6054ce9&units=" + localStorage.getItem("units");
	http.open("GET", dUrl);
	http.send();
	http.onreadystatechange=(e)=>{
		document.getElementById("widget").style.display = 'none';
		document.getElementById("apiInfo").style.display = '';
		var wd = JSON.parse(http.responseText);
		var wAlerts = wd.alerts[0];
		if (wAlerts) {
			var wAlertInfo = wd.alerts[0].description;
			var wAlertSeverity = wd.alerts[0].severity;
			var wAlertTitle = wd.alerts[0].title;
			var wAlertURI = wd.alerts[0].uri;
			document.getElementById("alertBlock").style.display = "";
			document.getElementById("alertBlock").style = "background-color: #FF6D6D; opacity:1.0; color:black; height:230px;"
			document.getElementById("alertTitle").innerHTML = wAlertTitle;
			document.getElementById("alertDesc").innerHTML = wAlertInfo;
			document.getElementById("alertIcon").style.display = '';
			document.getElementById("alertTitle").style.display = '';
			document.getElementById("alertDesc").style.display = '';
			document.getElementById("alertMore").style.display = '';
			
		} else {
			document.getElementById("alertIcon").style.display = 'none';
			document.getElementById("alertTitle").style.display = 'none';
			document.getElementById("currentC").style = "margin-bottom:2px;"
			document.getElementById("alertBlock").style = "background-color: transparent; opacity:0.0; color:black; height:0px;"
		}
		getWeather();
	}
	
}

function getWeather() {
	document.getElementById("wProvider").innerHTML = "weatherbit.io";
	document.getElementById("deets").innerHTML = "getting current weather conditions..."
	const http = new XMLHttpRequest();
	const dUrl = "https://api.weatherbit.io/v2.0/currently?lat=" + localStorage.getItem("lat") + "&lon=" + localStorage.getItem("lon") + "&key=6789ff326aa04cffb89e0f89c6054ce9&units=" + localStorage.getItem("units");
	http.open("GET", dUrl);
	http.send();
	http.onreadystatechange=(e)=>{
		var wd = JSON.parse(http.responseText);
		var temp = wd.data[0].temp;
		document.getElementById("temperature").innerHTML = temp;
		var conditions = wd.data[0].weather.description;
		document.getElementById("currentC").innerHTML = conditions;
		getNews();
	}
}

function getWeatherA() {
	document.getElementById("wProvider").innerHTML = "openweathermap.com";
	document.getElementById("deets").innerHTML = "getting current weather conditions...";
	document.getElementById("widget").style.display = "none";
	const http = new XMLHttpRequest();
	if (localStorage.getItem == "I") {var units = "imperial";}
	if (localStorage.getItem == "M") {var units = "metric";}
	if (localStorage.getItem == "K") {kelvinErr(); return;}
	const dUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + localStorage.getItem("lat") + "&lon=" + localStorage.getItem("lon") + "&APPID=2ba3c0dff8f39956e7d14a6b3dc07df5&units=imperial";
	http.open("GET", dUrl);
	http.send();
	http.onreadystatechange=(e)=>{
		var wd = JSON.parse(http.responseText);
		var temp = Math.round(wd.main.temp);
		document.getElementById("temperature").innerHTML = temp;
		var conditions = wd.weather[0].description;
		document.getElementById("currentC").innerHTML = conditions;
		document.getElementById("apiInfo").style.display = "";
		getForecastA();
	}
}

function getForecastA() {
	document.getElementById("deets").innerHTML = "getting future weather conditions...";
	const http = new XMLHttpRequest();
	if (localStorage.getItem == "I") {var units = "imperial";}
	if (localStorage.getItem == "M") {var units = "metric";}
	if (localStorage.getItem == "K") {kelvinErr(); return;}
	const dUrl = "http://api.openweathermap.org/data/2.5/forecast?lat=" + localStorage.getItem("lat") + "&lon=" + localStorage.getItem("lon") + "&APPID=2ba3c0dff8f39956e7d14a6b3dc07df5&units=imperial";
	http.open("GET", dUrl);
	http.send();
	http.onreadystatechange=(e)=>{
		var wd = JSON.parse(http.responseText);
		var highTemp = Math.round(wd.list[0].main.temp_max);
		var lowTemp = Math.round(wd.list[0].main.temp_min);
		var futureConditions = wd.list[0].weather[0].description;
		document.getElementById("fHigh").innerHTML = highTemp;
		document.getElementById("fLow").innerHTML = lowTemp;
		document.getElementById("fConditions").innerHTML = futureConditions;
		document.getElementById("forecastTxt").style.display = "";
		if (localStorage.getItem("units") === "I") {document.getElementById("dg").innerHTML = "°F"} 
		if (localStorage.getItem("units") === "M") {document.getElementById("dg").innerHTML = "°C"} 
		getNews();
	}
}

function getDate() {
	var d = new Date();
	var mo = d.getMonth() + 1;
	var da = d.getDate();
	var yr = d.getFullYear();		
	var hour = d.getHours();
	var minute = d.getMinutes();
	var seconds = d.getSeconds();
	if (hour < 12) {var ampm = "am"}
	if (hour === 12) {var ampm = "pm"}
	if (hour > 12) {var ampm = "pm"}
	if (localStorage.getItem('hrSys') === "us") {
		if (hour === 0) {var hour = 12}
		if (hour === 13) {var hour = 1}
		if (hour === 14) {var hour = 2}
		if (hour === 15) {var hour = 3}
		if (hour === 16) {var hour = 4}
		if (hour === 17) {var hour = 5}
		if (hour === 18) {var hour = 6}
		if (hour === 19) {var hour = 7}
		if (hour === 20) {var hour = 8}
		if (hour === 21) {var hour = 9}
		if (hour === 22) {var hour = 10}
		if (hour === 23) {var hour = 11}
	}
	minute = minute < 10 ? '0'+minute : minute;
	hour = hour < 10 ? '0'+hour : hour;
	seconds = seconds < 10 ? '0'+seconds : seconds;
	da = da < 10 ? '0'+da : da;
	mo = mo < 10 ? '0'+mo : mo;
	if (localStorage.getItem('dtSys') === 'us') {
		document.getElementById("date").innerHTML = '<span id="mo"></span>/<span id="da"></span>/<span id="yr"></span>'
	} else {
		document.getElementById("date").innerHTML = '<span id="da"></span>/<span id="mo"></span>/<span id="yr"></span>'
	}
	document.getElementById("hr").innerHTML = hour;
	document.getElementById("mi").innerHTML = minute;
	document.getElementById("se").innerHTML = seconds;
	document.getElementById("mo").innerHTML = mo;
	document.getElementById("da").innerHTML = da;
	document.getElementById("yr").innerHTML = yr;
	document.getElementById("ampm").innerHTML = ampm;
}

function openSettings() {
	document.getElementById("settings").style.display = "block";
}

function saveSettings() {
	localStorage.setItem("hrSys", document.getElementById("tDisplay").value);
	localStorage.setItem("dtSys", document.getElementById("dDisplay").value);
	localStorage.setItem("wMethod", document.getElementById("wMethod").value);
	localStorage.setItem("units", document.getElementById("sUnits").value);
	location.reload();
}

function confirmReset() {
	document.getElementById("settings").style.display = 'none';
	document.getElementById("confirmReset").style.display = '';
}

function resetSettings() {
	document.getElementById("resetLoad").style.display = ''
	localStorage.removeItem("dtSys");
	localStorage.removeItem("hrSys");
	localStorage.removeItem("lat");
	localStorage.removeItem("lon");
	localStorage.removeItem("units");
	localStorage.removeItem("rInt");
	localStorage.removeItem("wMethod")
	document.getElementById("resetLoad").style.display = 'none'
	document.getElementById("finishReset").style.display = ''
}

function embedWidget() {
	document.getElementById("widget").innerHTML = '<div id="weatherLoad" class="lds-ringdark"><div></div><div></div><div></div><div></div></div>'
	if (localStorage.getItem("units") === "I") {var units = "us"}
	if (localStorage.getItem("units") === "M") {var units = "ca"}
	if (localStorage.getItem("units") === "S") {switchToAPI();}
	const http = new XMLHttpRequest();
	const dUrl = "https://geocode.xyz/" + localStorage.getItem("lat") + "," + localStorage.getItem("lon") + "?geoit=json"
	http.open("GET", dUrl);
	http.send();
	http.onreadystatechange=(e)=>{
		var wd = JSON.parse(http.responseText);
		var city = wd.city;
		var state = wd.state;
		var weatherTitle = city + ", " + state;
		document.getElementById("widget").innerHTML = '<center><iframe id="forecast_embed" src="https://forecast.io/embed/#lat=' + localStorage.getItem("lat") + '&amp;lon=' + localStorage.getItem("lon") +'&amp;name=' + weatherTitle + '&amp;units=' + units + '" width="650" height="250" frameborder="0"></iframe></center>';
		getNews();
	}
}

function switchToAPI() {
	document.getElementById("kelvinErr").style.display = '';
	document.getElementById("loader").style.display = 'none';
}

function applySettings() {
	document.getElementById("dDisplay").value = localStorage.getItem("dtSys");
	if (!localStorage.getItem("dtSys")) {localStorage.setItem("dtSys", "uk"); refreshPage();}
	document.getElementById("tDisplay").value = localStorage.getItem("hrSys");
	if (!localStorage.getItem("dtSys")) {localStorage.setItem("hrSys", "uk"); refreshPage();}
	document.getElementById("wMethod").value = localStorage.getItem("wMethod");
}

function showLocation() {
	document.getElementById("lat").innerHTML = localStorage.getItem("lat");
	document.getElementById("lon").innerHTML = localStorage.getItem("lon");
	document.getElementById("geolocation").innerHTML = "[Loading]"
	document.getElementById("show-btn").style.display = 'none';
	document.getElementById("settingLoad").style.display = '';
	const http = new XMLHttpRequest();
	const dUrl = "https://geocode.xyz/" + localStorage.getItem("lat") + "," + localStorage.getItem("lon") + "?geoit=json"
	http.open("GET", dUrl);
	http.send();
	http.onreadystatechange=(e)=>{
		var wd = JSON.parse(http.responseText);
		var country = wd.country;
		var staddress = wd.staddress;
		var stnumber = wd.stnumber;
		var city = wd.city;
		var state = wd.state;
		var postal = wd.postal;
		document.getElementById("geolocation").innerHTML = stnumber + " " + staddress + "; " + city + ", " + state + "; " + country;
		document.getElementById("settingLoad").style.display = 'none';
	}
}

function update() {
	var d = new Date();
	var hour = d.getHours();
	var minute = d.getMinutes();
	var seconds = d.getSeconds();
	if (hour < 12) {var ampm = "am"}
	if (hour === 12) {var ampm = "pm"}
	if (hour > 12) {var ampm = "pm"}
	if (localStorage.getItem('hrSys') === "us") {
		if (hour === 0) {var hour = 12}
		if (hour === 13) {var hour = 1}
		if (hour === 14) {var hour = 2}
		if (hour === 15) {var hour = 3}
		if (hour === 16) {var hour = 4}
		if (hour === 17) {var hour = 5}
		if (hour === 18) {var hour = 6}
		if (hour === 19) {var hour = 7}
		if (hour === 20) {var hour = 8}
		if (hour === 21) {var hour = 9}
		if (hour === 22) {var hour = 10}
		if (hour === 23) {var hour = 11}
	}
	minute = minute < 10 ? '0'+minute : minute;
	hour = hour < 10 ? '0'+hour : hour;
	seconds = seconds < 10 ? '0'+seconds : seconds;
	document.getElementById("LUString").innerHTML = hour + ":" + minute + ":" + seconds + ampm;
}

function refreshPage() {
	document.getElementById("missingSettings").style.display = ""
	document.getElementById("rSeconds").innerHTML = "5";
	setTimeout(function () {
		document.getElementById("rSeconds").innerHTML = "4";
		setTimeout(function () {
			document.getElementById("rSeconds").innerHTML = "3";
			setTimeout(function () {
				document.getElementById("rSeconds").innerHTML = "2";
				setTimeout(function () {
						document.getElementById("rSeconds").innerHTML = "1";
						setTimeout(function () {
							location.reload();
						}, 1000);
					}, 1000);
			}, 1000);
		}, 1000);
	}, 1000);
}

function getNews() {
	document.getElementById("deets").innerHTML = "gettings news stories...";
	const http = new XMLHttpRequest();
	const dUrl = "https://newsapi.org/v2/top-headlines?sources=associated-press&apiKey=af3de0ad8360434493a8cad8564cdf7f"
	http.open("GET", dUrl);
	http.send();
	http.onreadystatechange=(e)=>{
		var wd = JSON.parse(http.responseText);
		if (wd.totalResults === 0) {
			noNews();
			return;
		} else {
			var a1Title = wd.articles[0].title;
			var a2Title = wd.articles[1].title;
			var a1Desc = wd.articles[0].description;
			var a2Desc = wd.articles[1].description;
			var a1Url = wd.articles[0].url;
			var a2Url = wd.articles[1].url;
			document.getElementById("article1Title").innerHTML = a1Title;
			document.getElementById("article2Title").innerHTML = a2Title;
			document.getElementById("article1Desc").innerHTML = a1Desc;
			document.getElementById("article2Desc").innerHTML = a2Desc;
			document.getElementById("article1URL").src = "https://www.qrtag.net/api/qr.png?url=" + a1Url;
			document.getElementById("article2URL").src = "https://www.qrtag.net/api/qr.png?url=" + a2Url;
			document.getElementById("loader").style.display = 'none';
		}
	}
}

function noNews() {
	document.getElementById("articleTitle").innerHTML = "Error!"
	document.getElementById("articleDesc").innerHTML = "No news avaliable in your area right now."
}

function saveCode() {
	localStorage.setItem("country", document.getElementById("countryCodeInpt").value);
	location.reload();
	document.getElementById("locLoad").style.display = '';
	document.getElementById("countryCode").style.display = 'none';
}