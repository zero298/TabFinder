// Function to do searching within chrome
function searchtabs() {
   chrome.tabs.query({
      title: ""
   },
   // Callback to process results
   function(results) {
      // Place holder for the tab to process
      var foundTabTitle = null;

      // Text to match against         
      var queryText = document.getElementById("textToSearchInput").value;

      // Div to place divs of matched title in
      var queryAnswerDiv = document.getElementById("foundTabsDiv");

      // Clear the current children
      while (queryAnswerDiv.hasChildNodes()) {
         queryAnswerDiv.removeChild(queryAnswerDiv.lastChild);
      }

      // Iterate over all the results
      for (var i = 0; i < results.length; i++) {
         // Keep track of the tab that is currently being processed
         foundTabTitle = results[i].title;

         // If we don't care about case sensative, make bother lower case
         if (localStorage["case_sensing"] === "no") {
            queryText = queryText.toLocaleLowerCase();
            foundTabTitle = foundTabTitle.toLocaleLowerCase();
         }

         // If we have a title containing our string...
         if (foundTabTitle.indexOf(queryText) > -1) {
            // Create a new div
            var tabDiv = document.createElement("div");
            // Set its content to the tabs title
            tabDiv.innerHTML = results[i].title;
            // Let it know what the tabs id is
            tabDiv.tabToSwitchTo = results[i].id;
            // Allow for users to click on the representing div to switch to it
            tabDiv.onclick = function() {
               // Make the tab selected
               chrome.tabs.update(this.tabToSwitchTo, {
                  selected: true
               });
            };
            // Append the created div to our answer div
            queryAnswerDiv.appendChild(tabDiv);
         }
      }
   });
}

// Set up event listeners and focus on field
document.addEventListener('DOMContentLoaded', function() {
   document.getElementById("instructions").innerHTML = chrome.i18n.getMessage("instruction");
   var inputField = document.getElementById("textToSearchInput");
   inputField.focus();
   inputField.onkeydown = searchtabs;
});