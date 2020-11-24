onStartup();
smallDisp();

setInterval(function() {
	getDate();
	if (document.readyState === 'complete') {
		document.getElementById("loader").style.display = "none";
	} else {
		document.getElementById("loader").style.display = "";
	}
}, 100);

setInterval(function() {
	onStartup();
}, 1800000);

setInterval(function() {
	goBtwn();
}, 60000);


function goBtwn() {
	if (document.getElementById("newsBlock1").style.display === 'none') {
		document.getElementById("newsBlock1").style.display = 'block';
		document.getElementById("newsBlock2").style.display = 'block';
		document.getElementById("newsBlock3").style.display = 'none';
		document.getElementById("newsBlock4").style.display = 'none';
	} else {
		document.getElementById("newsBlock1").style.display = 'none';
		document.getElementById("newsBlock2").style.display = 'none';
		document.getElementById("newsBlock3").style.display = 'block';
		document.getElementById("newsBlock4").style.display = 'block';
	}
}

function onStartup() {
	document.getElementById("LUString").innerHTML = "Updating right now..."
	document.getElementById("deets").innerHTML = "checking saved information...";
	if (!localStorage.getItem("lat") | !localStorage.getItem("lon") | !localStorage.getItem("units")) {getLocationPerm(); return;}
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
	getBack();
}

function getLocationPerm() {
	document.getElementById("settings").style.display = "none"
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
	document.getElementById("deets").innerHTML = "got location... saving...";
	location.reload();
	document.getElementById("locLoad").style.display = '';
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
		var temp = Math.round(wd.data[0].temp);
		document.getElementById("temperature").innerHTML = temp;
		var conditions = wd.data[0].weather.description;
		document.getElementById("currentC").innerHTML = conditions;
		getForecast();
	}
}

function getForecast() {
	document.getElementById("deets").innerHTML = "getting future weather conditions..."
	const http = new XMLHttpRequest();
	const dUrl = "https://api.weatherbit.io/v2.0/forecast/daily?lat=" + localStorage.getItem("lat") + "&lon=" + localStorage.getItem("lon") + "&key=6789ff326aa04cffb89e0f89c6054ce9&units=" + localStorage.getItem("units");
	http.open("GET", dUrl);
	http.send();
	http.onreadystatechange=(e)=>{
		var wd = JSON.parse(http.responseText);
		var highTemp = Math.round(wd.data[1].high_temp);
		var lowTemp = Math.round(wd.data[1].high_temp);
		var futureConditions = wd.data[1].weather.description;
		document.getElementById("fHigh").innerHTML = highTemp;
		document.getElementById("fLow").innerHTML = lowTemp;
		document.getElementById("fConditions").innerHTML = futureConditions;
		document.getElementById("forecastTxt").style.display = "";
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
	const dUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + localStorage.getItem("lat") + "&lon=" + localStorage.getItem("lon") + "&APPID=2ba3c0dff8f39956e7d14a6b3dc07df5&units=imperial";
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
	const dUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + localStorage.getItem("lat") + "&lon=" + localStorage.getItem("lon") + "&APPID=2ba3c0dff8f39956e7d14a6b3dc07df5&units=imperial";
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
	const dUrl = "https://cors-anywhere.herokuapp.com/https://newsapi.org/v2/top-headlines?sources=associated-press&apiKey=af3de0ad8360434493a8cad8564cdf7f"
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
			var a3Title = wd.articles[2].title;
			var a4Title = wd.articles[3].title;
			var a1Desc = wd.articles[0].description;
			var a2Desc = wd.articles[1].description;
			var a3Desc = wd.articles[2].description;
			var a4Desc = wd.articles[3].description;
			var a1Url = wd.articles[0].url;
			var a2Url = wd.articles[1].url;
			var a3Url = wd.articles[2].url;
			var a4Url = wd.articles[3].url;
			document.getElementById("article1Title").innerHTML = a1Title;
			document.getElementById("article2Title").innerHTML = a2Title;
			document.getElementById("article3Title").innerHTML = a3Title;
			document.getElementById("article4Title").innerHTML = a4Title;
			document.getElementById("article1Desc").innerHTML = a1Desc;
			document.getElementById("article2Desc").innerHTML = a2Desc;
			document.getElementById("article3Desc").innerHTML = a3Desc;
			document.getElementById("article4Desc").innerHTML = a4Desc;
			document.getElementById("article1URL").src = "https://www.qrtag.net/api/qr.png?url=" + a1Url;
			document.getElementById("article2URL").src = "https://www.qrtag.net/api/qr.png?url=" + a2Url;
			document.getElementById("article3URL").src = "https://www.qrtag.net/api/qr.png?url=" + a3Url;
			document.getElementById("article4URL").src = "https://www.qrtag.net/api/qr.png?url=" + a4Url;
			document.getElementById("deets").innerHTML = "loading HQ background..."
		}
	}
}

function noNews() {
	document.getElementById("articleTitle").innerHTML = "Error!"
	document.getElementById("articleDesc").innerHTML = "No news avaliable in your area right now."
}

function smallDisp() {
	if (screen.availWidth < 1503) {
		document.getElementById("smallDispWarn").style.display = "";
	} else {
		document.getElementById("smallDispWarn").style.display = "none";
	}
}

function getBack() {
	var backs = [
		"img/1.jpg",
		"img/2.jpg",
		"img/3.jpg",
		"img/4.jpg"
	]
	var curBack = backs[Math.floor(Math.random() * backs.length)];
	document.getElementById("backUrl").innerHTML = 'body {background-image: url("'+ curBack + '")}';
	if (curBack === "img/1.jpg") {var cred = '<a href="https://pixabay.com/photos/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=690375">Free-Photos</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=690375">Pixabay</a>'}
	if (curBack === "img/2.jpg") {var cred = '<a href="https://pixabay.com/users/StockSnap-894430/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1298016">StockSnap</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1298016">Pixabay</a>'}
	if (curBack === "img/3.jpg") {var cred = '<a href="https://pixabay.com/users/3093594-3093594/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1598418">Markus Christ</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1598418">Pixabay</a>'}
	if (curBack === "img/4.jpg") {var cred = '<a href="https://pixabay.com/users/cegoh-94852/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=255116">Jason Goh</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=255116">Pixabay</a>'}
	document.getElementById("photoCredit").innerHTML = cred;
}
