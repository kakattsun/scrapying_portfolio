var bingUrl = "https://www.bing.com/";
var FeedbackFwlink = "https://go.microsoft.com/fwlink/?linkid=2138838";
var Market = chrome.i18n.getMessage("ExtnMarket");
var ExtensionId = chrome.runtime.id;
var ExtensionVersion = chrome.runtime.getManifest().version;

var machineID = "";
setTimeout(function () {
    chrome.storage.local.get("MachineID", function (items) {
        if (items.MachineID) {
            machineID = items.MachineID;
            console.log("Update MachineID:" + machineID);
        }
        else {
            machineID = guid();
            console.log("New MachineID: " + machineID);
        }
    });
}, 700);

//Sets '_NTPC' session cookies in bing.com domain whenever background.js gets executed
setTimeout(function () {
    var defaultPC = "U558";
    chrome.cookies.set({ url: bingUrl, domain: '.bing.com', name: '_NTPC', value: defaultPC }, function (cookie) {
    });
    chrome.storage.local.get(['BingDefaultsSet', 'channel', '_dpc', 'MachineID', 'pc'], function (items) {
        if (!items.BingDefaultsSet) {
            setStorage("BingDefaultsSet", "done");
            setStorage("ExtnVersion", ExtensionVersion);
            setStorage("Migration", "True");
            SendPingDetails("1");
        }
        if (items.channel) {
            var _dpc = items._dpc;
            if (_dpc == undefined || _dpc == "" || _dpc == null) {
                _dpc = items.pc;
            }
            chrome.cookies.set({ url: bingUrl, domain: '.bing.com', name: '_DPC', value: _dpc }, function (cookie) {
            });
        }

        //To redirect feedback page while uninstalling the extension
        var uninstallUrl = FeedbackFwlink + "&extnID=" + ExtensionId + "&mkt=" + Market + "&mid=" + items.MachineID + "&br=gc";
        //var uninstallUrl = FeedbackFwlink + "&extnID=cflanjgoamglnnocilcllegbbbfogfjc" + "&mkt=" + Market + "&mid=" + MachineID + "&br=gc";
        chrome.runtime.setUninstallURL(uninstallUrl);
    });
}, 1000);

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'update') {
        console.log("Update Method");
		chrome.storage.local.set({showFirstSearchNotification: false});
		chrome.storage.local.get(["ExtnVersion","Migration"], function (result) {
			if(!result.Migration){
				setStorage("Migration", "True");
				if (!result.ExtnVersion || result.ExtnVersion != chrome.runtime.getManifest().version) {
					console.log("Enter Update chrome storage - Only for Existing users");
					setStorage("_dpc", localStorage["_dpc"]);
					setStorage("MachineID", localStorage["MachineID"]);
					setStorage("pc", localStorage["pc"]);
					setStorage("PingDate", localStorage["PingDate"]);
					setStorage("channel", localStorage["channel"]);
					setStorage("BingDefaultsSet", localStorage["BingDefaultsSet"]);
					console.log("Exit update chrome storage - Only for Existing users");
				}
			}
        });
		setStorage("ExtnVersion", ExtensionVersion);

        setTimeout(function () {
            //Call for Update Ping
            SendPingDetails("3");
        }, 2000);
    }
});

setTimeout(function () {
    chrome.tabs.onActivated.addListener(function () {
        chrome.storage.local.get("PingDate", (items) => {
            if (items.PingDate == "" || items.PingDate != new Date().toDateString()) {
                SendPingDetails("2");
                var todate = new Date().toDateString();
                setStorage("PingDate", todate);
            }
        });
    });
}, 2000);

function SendPingDetails(status) {
    /**
    * Function create and send a ping cosmos
    * @param {any} status
    */
    var startIndex = navigator.userAgent.indexOf("(");
    var endIndex = navigator.userAgent.indexOf(")");
    var OS = navigator.userAgent.substring(startIndex + 1, endIndex).replace(/\s/g, '');
    var browserLanguage = navigator.language;

    var manifestData = chrome.runtime.getManifest();
    var ExtensionVersion = manifestData.version;

    var ExtensionName = manifestData.name.replace(/ /g, "").replace('&', 'and');
    var ExtensionId = chrome.runtime.id;

    var BrowserVersion = navigator.userAgent.substr(navigator.userAgent.indexOf("Chrome")).split(" ")[0].replace("/", "");


    setTimeout(function () {
        chrome.storage.local.get(['pc', 'channel', '_dpc', 'MachineID', 'muid'], (items) => {
            var pc = items.pc == undefined || items.pc == "" || items.pc == null ? "U558" : items.pc;
            var pingURL = 'http://g.ceipmsn.com/8SE/44?';
            var tVData = 'TV=is' + pc + '|pk' + ExtensionName + '|tm' + browserLanguage + '|bv' + BrowserVersion + '|ex' + ExtensionId + '|es' + status;
            if (items.channel)
                tVData = tVData + "|ch" + items.channel;
            if (items._dpc)
                tVData = tVData + "|dp" + items._dpc;
            if (items.muid)
                tVData = tVData + "|mu" + items.muid;
            pingURL = pingURL + 'MI=' + items.MachineID + '&LV=' + ExtensionVersion + '&OS=' + OS + '&TE=37&' + tVData;
            pingURL = encodeURI(pingURL);  // For HTML Encoding
            var xhr = new XMLHttpRequest();
            xhr.open("GET", pingURL, true);
            xhr.send();
        });
    }, 500);
};