//// global variables:

var version = "1.1.2"; // widget version number
var gDoneButton;
var gInfoButton;
var refreshSpeed = 2000;
var activeTab = 0;	// 0 is CPU, 1 is RAM
var psInterval;		// stores the process refresh interval for future cancellation
var uptimeInterval;	// stores the uptime refresh interval for future cancellation
var psCommand = "/bin/ps -racwwxo \"%cpu command\" | head -6 | tail -5";  // command executed when generating process list, changes for CPU or RAM


//// widget infrastructure:

function setup(){ // called when html loaded
	if(window.widget){
		widget.onshow = onshow;
		widget.onhide = onhide;
		widget.onremove = onremove;
	}

	if(widget.preferenceForKey("version") != version){
		// preferences do not exist or are out of date: create preferences with default values
		widget.setPreferenceForKey(version, "version");
		widget.setPreferenceForKey(2000, "refreshSpeed");
		widget.setPreferenceForKey(true, "uptime");
		widget.setPreferenceForKey(false, "tab");
	}
	// apply preferences
	refreshSpeed = widget.preferenceForKey("refreshSpeed") * 1;
	switch(refreshSpeed){
		case 1000:
			document.getElementById("speedSelect").selectedIndex = 0;
			break;
		case 2000:
			document.getElementById("speedSelect").selectedIndex = 1;
			break;
		case 3000:
			document.getElementById("speedSelect").selectedIndex = 2;
			break;
		case 5000:
			document.getElementById("speedSelect").selectedIndex = 3;
			break;
		case 10000:
			document.getElementById("speedSelect").selectedIndex = 4;
	}
	if(widget.preferenceForKey("uptime") == true){
		document.getElementById('uptime').style.display = "block";
		document.getElementById('uptimeCheckbox').checked = true;
	}
	if(widget.preferenceForKey("tab") == true){
		switchTab(1);
	}
	
	gDoneButton = new AppleGlassButton(document.getElementById("doneButton"), "Done", hidePrefs);
	gInfoButton = new AppleInfoButton(document.getElementById("infoButton"), document.getElementById("front"), "black", "black", showPrefs);	
}


function onremove(){ // called when widget is consciously closed, sets prefs to defaults
	widget.setPreferenceForKey(2000, "refreshSpeed");
	widget.setPreferenceForKey(true, "uptime");
	widget.setPreferenceForKey(false, "tab");
}


function showPrefs(){ // called when flipping to back
	onhide();
	
	if(window.widget)
		widget.onshow = void(0);
	var front = document.getElementById("front");
	var back = document.getElementById("back");
	if (window.widget)
		widget.prepareForTransition("ToBack"); // freeze appearance
	front.style.display="none";
	back.style.display="block";
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);
}


function hidePrefs(){ // called when flipping to front
	applyPrefs();
	onshow();
	
	if(window.widget)
		widget.onshow = onshow;
	var front = document.getElementById("front");
	var back = document.getElementById("back");
	if (window.widget)
		widget.prepareForTransition("ToFront"); // freeze appearance
	back.style.display="none";
	front.style.display="block";
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);
}


function applyPrefs(){
	var speedSelect = document.getElementById("speedSelect");
	var optionValue = speedSelect.options[speedSelect.selectedIndex].value;
	widget.setPreferenceForKey(optionValue, "refreshSpeed");
	refreshSpeed = widget.preferenceForKey("refreshSpeed");
	
	var uptimeSet = document.getElementById('uptimeCheckbox').checked;
	widget.setPreferenceForKey(uptimeSet, "uptime");
	if(uptimeSet)
		document.getElementById('uptime').style.display = "block";
	else
		document.getElementById('uptime').style.display = "none";
}


function onhide(){ // called when flipping to back or dashboard is hidden
	window.clearInterval(psInterval);
	window.clearInterval(uptimeInterval);
}


function onshow(){ // called on widget launch, when flipping to front, or when dashboard is shown
	window.clearInterval(psInterval);
	window.clearInterval(uptimeInterval);

	var callPs1 = widget.system(psCommand, doPs);
	psInterval = window.setInterval(function(){
		var callPs2 = widget.system(psCommand, doPs);
		},refreshSpeed);

	var callSysctl1 = widget.system("/usr/sbin/sysctl kern.boottime", doUptime);
	uptimeInterval = window.setInterval(function(){
		var callSysctl2 = widget.system("/usr/sbin/sysctl kern.boottime", doUptime);
		},60000);
}


//// feature algorithms, etc:

function doPs(result){ // generates and outputs process list
	var rawString = result.outputString;
	var lines = new Array();
	lines = rawString.split("\n");
	var nameString = "";
	var dataString = "";
	if(activeTab == 0){ // CPU
		for(var x = 0; x < 5; x++){
			var breakIndex = lines[x].indexOf(" ",2)
			nameString += lines[x].substr(breakIndex,26) + "<br />";
			dataString += lines[x].substring(0,breakIndex) + "%<br />";
		}
	}else{ // RAM
		for(var x = 0; x < 5; x++){
			var breakIndex = lines[x].indexOf(" ",2)
			nameString += lines[x].substr(breakIndex,26) + "<br />";
			dataString += parseRAM(lines[x].substring(0,breakIndex)) + "<br />";
		}
	}
	document.getElementById('processList').innerHTML = nameString;
	document.getElementById('dataList').innerHTML = dataString;
}


function parseRAM(raw){ // formats RAM usage for process list
	// raw value is in kb (1024 bytes)
	var output = Math.round(raw / 1024);
	if(output >= 1024)
		output = Math.round(output / 1024 *100)/100 + " GB";
	else
		output += " MB";
	return output;
}


function doUptime(result) { // generates and outputs uptime display
	var bootTime = result.outputString;
	bootTime = bootTime.substring(22, bootTime.indexOf(','));
	var curTime = widget.system("/bin/date +%s", null).outputString;
	curTime -= bootTime;
	var upMin = Math.floor(curTime / 60);
	var upHrs = Math.floor(upMin / 60);
	upMin -= upHrs * 60;
	if(upHrs >= 24){
		var upDay = Math.floor(upHrs / 24);
		upHrs -= upDay * 24;
		var output = upDay + "d " + upHrs + "h";
	}else{
		var output = upHrs + "h " + upMin + "m";
	}
	document.getElementById('uptime').innerHTML = output;
}


function switchTab(tab){ // called when the user presses a tab
	if(tab == activeTab){
		return;
	}else{
		activeTab = tab;
	}
	
	if(tab == 0){ // switch to CPU
		document.getElementById('ram').className = "tabInactive";
		document.getElementById('cpu').className = "tabActive";
		psCommand = "/bin/ps -racwwxo \"%cpu comm\" | head -6 | tail -5";
		widget.setPreferenceForKey(false, "tab");
	}else{ // switch to RAM
		document.getElementById('cpu').className = "tabInactive";
		document.getElementById('ram').className = "tabActive";
		psCommand = "/bin/ps -macwwxo \"rss comm\" | head -6 | tail -5";
		widget.setPreferenceForKey(true, "tab");
	}
	window.clearInterval(psInterval);
	var callPs1 = widget.system(psCommand, doPs);
	psInterval = window.setInterval(function(){
		var callPs2 = widget.system(psCommand, doPs);
		},refreshSpeed);
}