
// Entry function for GSC processing
async function handleGSC(r) {
	console.log("Processing GSC content...", r);

	// Parse out the query string
	let urlQueryParams = new URLSearchParams(r.url.split("?")[1]);
	let searchQuery = urlQueryParams.get("q");

	console.log("Google search string: \"" + searchQuery + "\"");

	// Split up the search query
	searchQueryChunks = searchQuery.split(" ");
	if (searchQueryChunks.length < 2) {
		return;
	}

	// Get the GSC indicator string
	let gscIndicator = (await browser.storage.local.get()).indicator;

	console.log("Loaded GSC indicator:", gscIndicator);

	// Check if GSC indicator is present and valid
	if (!searchQueryChunks[0].startsWith(gscIndicator) || searchQueryChunks[0].length < gscIndicator.length+1) {
		return;
	}

	// Parse out the GSC name
	let gscName = searchQueryChunks[0].slice(gscIndicator.length);

	console.log("Using GSC:", gscName);

	// Determine the GSC contents
	let gscContents = await getGSCContent(gscName);

	// Make sure the GSC was found
	if (!gscContents) {
		return;
	}

	console.log("GSC contents:", gscContents);

	// Craft the new query string
	let newQueryString = searchQueryChunks.slice(1).join(" ") + " " + gscContents

	// Update the query string
	urlQueryParams.set("q", newQueryString);

	return {
		redirectUrl: r.url.split("?")[0] + "?" + urlQueryParams.toString()
	};
}

// Returns the contents of the corresponding GSC 
async function getGSCContent(gscName) {
	let content = undefined;

	// Grab the existing containers form storage
	let opts = await browser.storage.local.get();

	// If the container exists
	for(let i=0; i<opts.containers.length; i++){
		let c = opts.containers[i];
		if (c.name === gscName){
			content = c.content;
			break;
		}
	}

	return content
}

// Hook out GSC handler into web requests
browser.webRequest.onBeforeRequest.addListener(
	handleGSC,
	{urls: ["https://www.google.com/search*"]},
	["blocking"]
);