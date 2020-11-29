async function saveOptions(e) {
	// Disable default behavior
	e.preventDefault();

	// Check indicator field for validity
	let providedIndicator = getIndicatorInput().value;
	if (providedIndicator.includes(" ")){
		console.error("Invalid indicator provided (cannot contain spaces):", providedIndicator);
	}

	// Save the data
	browser.storage.local.set({
		"indicator": providedIndicator,
		"containers": parseGSCForms()
	});

	console.log("Saved GSC options");
}

async function restoreOptions(){
	console.log("Restoring GSC options");

	// Load the options
	let options = await browser.storage.local.get().catch(e => {
		console.error("Failed to load options:", e);
	})

	// Handle first time load (Apparently this is good for empty object?)
	if (Object.keys(options).length === 0) {
		let defaultOptions = {
			"indicator": "!!",
			"containers": []
		};

		// Set default values
		await browser.storage.local.set(defaultOptions).catch(e => {
			console.error("Failed to store defaults:", e)
		});

		// Set options appropriately
		options = defaultOptions;
	}

	// Populate the indicator text box
	getIndicatorInput().value = options.indicator;

	// Dynamically create and populate containers
	for(let i=0; i<options.containers.length; i++){
		createGSCForm(undefined, options.containers[i]);
	}	

	console.log("GSC options restored!");
}

function parseGSCForms(){
	console.log("Converting GSC forms to JSON data");

	// Grab all GSC forms
	let gscForms = document.getElementsByClassName("gsc-form");
	let gscContainers = [];

	// Iterate over them all 
	for(let i=0; i<gscForms.length; i++){
		let gscForm = gscForms[i];
		let formNameInput = gscForm.querySelector(".gsc-form-name-input");
		let formContentInput = gscForm.querySelector(".gsc-form-content-input");
		gscContainers.push({
			"name": formNameInput.value,
			"content": formContentInput.value
		});
	}

	return gscContainers;
}

function createGSCForm(e, gsc){
	console.log("Creating GSC Form:", gsc);
	// Grab the GSC container div
	let gscDiv = document.getElementById("gsc-container-div");

	// Create the GSC form elements
	let gscForm = document.createElement("div");
	let gscName = document.createElement("label");
	let gscContent = document.createElement("label");
	let gscNameInput = document.createElement("input");
	let gscContentInput = document.createElement("input");
	let gscDelete = document.createElement("span");

	// If GSC is provided, populate the inputs
	if (gsc) {
		gscNameInput.value = gsc.name;
		gscContentInput.value = gsc.content;
	}

	// Set up the elements
	gscDelete.innerHTML = "X";
	gscDelete.className = "gsc-form-delete-button";
	gscDelete.onclick = function() {
		gscDiv.removeChild(gscForm);
	};
	gscName.innerHTML = "Name";
	gscName.className = "gsc-form-label";
	gscNameInput.className = "gsc-form-name-input";
	gscContent.innerHTML = "Content";
	gscContent.className = "gsc-form-label";
	gscContentInput.className = "gsc-form-content-input";
	gscForm.className = "gsc-form";

	// Hook everything together
	gscName.appendChild(gscNameInput);
	gscContent.appendChild(gscContentInput);
	gscForm.appendChild(gscName);
	gscForm.appendChild(gscContent);
	gscForm.appendChild(gscDelete);
	gscDiv.appendChild(gscForm);
}

function getIndicatorInput(){
	return document.getElementById("gsc-indicator-txtbox");
}

// When page loads, restore the saved options
document.addEventListener("DOMContentLoaded", restoreOptions);
// When save is pressed, save the options
document.querySelector("form").addEventListener("submit", saveOptions);
// When "+" is pressed, create new GSC
document.querySelector("#new-gsc-button").addEventListener("click", createGSCForm);
