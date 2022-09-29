/* Function to create an unique machine id */
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    var MachineGUID = s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    MachineGUID = MachineGUID.toLocaleUpperCase();
    setStorage("MachineID", MachineGUID);
    return MachineGUID;
}

//setStorage function
function setStorage(name, value) {

    if (value) {
        var obj = '{'
            + '"' + name + '" :"' + value + '"'
            + '}';
        var storageName = JSON.parse(obj);
        chrome.storage.local.set(storageName, function () {
            var date = new Date();
            var millisec = date.getTime();
            console.log("Name: " + name + "   " + "Value: " + value);
            console.log("Time stamp:" + date, millisec);
        });
    }
    else {
        if (name == "MachineID") {
            var obj = '{'
                + '"' + name + '" :"' + guid() + '"'
                + '}';
            var storageName = JSON.parse(obj);
            chrome.storage.local.set(storageName, function () {
                var date = new Date();
                var millisec = date.getTime();
                console.log("Name: " + name + "   " + "Value: " + value);
                console.log("Time stamp MachineId in else:" + date, millisec);
            });
        }
        if (name == "pc") {
            var obj = '{'
                + '"' + name + '" :"' + "U558" + '"'
                + '}';
            var storageName = JSON.parse(obj);
            chrome.storage.local.set(storageName);
        }
        if (name == "PingDate") {
            var obj = '{'
                + '"' + name + '" :"' + new Date().toDateString() + '"'
                + '}';
            var storageName = JSON.parse(obj);
            chrome.storage.local.set(storageName);
        }
        if (name == "BingDefaultsSet") {
            var obj = '{'
                + '"' + name + '" :"' + "done" + '"'
                + '}';
            var storageName = JSON.parse(obj);
            chrome.storage.local.set(storageName);
        }
    }
}

var browserDefaultsUrl = "https://browserdefaults.microsoft.com/";
var defaultPC = "U558";

setTimeout(function () {
    chrome.storage.local.get('pc', (items) => {
        if (!items.pc) {
            console.log("Enter outside cookie logic - inside PC");
            chrome.cookies.getAll({}, function (cookies) {

                for (var i in cookies) {
                    cookieFound = false;
                    if (cookies[i].name == "PCCode") {
                        defaultPC = cookies[i].value;
                        cookieFound = true;
                        setStorage("pc", defaultPC);
                    }
                    else if (cookies[i].name == "channel") {
                        setStorage("channel", cookies[i].value);
                        cookieFound = true;
                    }
                    //Remove cookies value
                    if (cookieFound) {
                        var url = "http" + (cookies[i].secure ? "s" : "") + "://" + cookies[i].domain + cookies[i].path;
                        chrome.cookies.remove({ "url": url, "name": cookies[i].name });
                    }
                }
            });

            chrome.cookies.get({ url: browserDefaultsUrl, name: 'PCCode' }, function (cookie) {
                if (cookie) {
                    console.log("Set browserDefaults cookie logic outside-PCCode");
                    defaultPC = cookie.value;
                    setStorage("pc", defaultPC);
                    chrome.cookies.remove({ url: browserDefaultsUrl, name: 'PCCode' });
                }
            });
            chrome.cookies.get({ url: browserDefaultsUrl, name: 'channel' }, function (cookie) {
                if (cookie) {
                    console.log("Set browserDefaults cookie logic outside-channel");
                    setStorage("channel", cookie.value);
                    chrome.cookies.remove({ url: browserDefaultsUrl, name: 'channel' });
                }
            });

            setTimeout(function () {
                console.log("Set _dpc - outside");
                chrome.storage.local.get(['pc', 'channel'], (items) => {
                    if (items.pc != "" && items.pc != undefined && items.channel != "" && items.channel != undefined) {
                        setStorage("_dpc", items.pc + "_" + items.channel);
                    }
                    else if (items.channel != "" && items.channel != undefined) {
                        setStorage("_dpc", items.channel);
                    }
                });
            }, 300);
            console.log("Exit outside cookie logic - inside PC");
        }
    });
}, 500);

chrome.management.onEnabled.addListener(function (ExtensionInfo) {
    console.log("Enter onEnabled");
    chrome.storage.local.get(['pc'], (items) => {
        if (!items.pc) {
            console.log("Enter onEnabled cookie logic - inside PC");
            chrome.cookies.getAll({}, function (cookies) {

                for (var i in cookies) {
                    cookieFound = false;
                    if (cookies[i].name == "PCCode") {
                        defaultPC = cookies[i].value;
                        cookieFound = true;
                        setStorage("pc", defaultPC);
                    }
                    else if (cookies[i].name == "channel") {
                        setStorage("channel", cookies[i].value);
                        cookieFound = true;
                    }
                    //Remove cookies value
                    if (cookieFound) {
                        var url = "http" + (cookies[i].secure ? "s" : "") + "://" + cookies[i].domain + cookies[i].path;
                        chrome.cookies.remove({ "url": url, "name": cookies[i].name });
                    }
                }
            });
            chrome.cookies.get({ url: browserDefaultsUrl, name: 'PCCode' }, function (cookie) {
                if (cookie) {
                    console.log("Set onEnabled browserDefaults cookie logic-PCCode");
                    defaultPC = cookie.value;
                    setStorage("pc", defaultPC);
                    chrome.cookies.remove({ url: browserDefaultsUrl, name: 'PCCode' });
                }
            });
            chrome.cookies.get({ url: browserDefaultsUrl, name: 'channel' }, function (cookie) {
                if (cookie) {
                    console.log("Set onEnabled browserDefaults cookie logic-channel");
                    setStorage("channel", cookie.value);
                    chrome.cookies.remove({ url: browserDefaultsUrl, name: 'channel' });
                }
            });
            setTimeout(function () {
                chrome.storage.local.get(['pc', 'channel'], (items) => {
                    console.log("Set _dpc - onEnabled");
                    if (items.pc != "" && items.pc != undefined && items.channel != "" && items.channel != undefined) {
                        setStorage("_dpc", items.pc + "_" + items.channel);
                    }
                    else if (items.channel != "" && items.channel != undefined) {
                        setStorage("_dpc", items.channel);
                    }
                });
            }, 300);
            console.log("Exit onEnabled cookie logic - inside PC");
        }
    });
    console.log("Exit onEnabled");
});

chrome.browserAction.onClicked.addListener(function (tab) {
    var redirectURL = "https://www.bing.com/?pc=U558";
    chrome.storage.local.get('pc', (items) => {
        if (items.pc) {
            redirectURL = "https://www.bing.com/?pc=" + items.pc;
        }
        chrome.tabs.create({ url: redirectURL });
    });
});

