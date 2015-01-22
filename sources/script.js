﻿/*
WhatsApp Toolkit
Author: Cristian Perez <http://www.cpr.name>
License: GNU GPLv3
*/


var debug = false;

// Prevent page exit confirmation dialog (the content script's window object is not shared: http://stackoverflow.com/a/12396221/423171)
var scriptElem = document.createElement("script");
scriptElem.innerHTML = "window.onbeforeunload = null;"
document.head.appendChild(scriptElem);

chrome.runtime.sendMessage({ name: "getIsBackgroundPage" }, function (isBackgroundPage)
{
	if (isBackgroundPage)
	{
		if (debug) console.info("WhatsApp Toolkit: Script injected");

		reCheckStatus();
	}
	else
	{
		if (debug) console.info("WhatsApp Toolkit: Script injection cancelled");
	}
});

function reCheckStatus()
{
	setTimeout(function () { checkStatus(); }, 5000);
}

function checkStatus()
{
	if (debug) console.info("WhatsApp Toolkit: Checking status...");

	try
	{
		// Should match definition of var isSessionReadyCode in background.js
		var isSessionReady = document.getElementsByClassName('pane-list-user').length > 0 || document.getElementsByClassName('entry-main').length > 0;
		if (isSessionReady)
		{
			if (debug) console.info("WhatsApp Toolkit: Session is ready");

			reCheckStatus(); return;
		}
		else
		{
			if (debug) console.warn("WhatsApp Toolkit: Session is not ready, checking if should reconnect...");

			chrome.runtime.sendMessage({ name: "getAttemptReconnect" }, function (attemptReconnect)
			{
				if (attemptReconnect)
				{
					if (debug) console.info("WhatsApp Toolkit: Reconnecting...");

					window.location.reload();
				}
				else
				{
					if (debug) console.info("WhatsApp Toolkit: Not attempting to reconnect");
				}

				reCheckStatus(); return;
			});
		}
	}
	catch (err)
	{
		console.error("WhatsApp Toolkit: Exception while checking status");
		console.error(err);
		
		reCheckStatus(); return;
	}
}