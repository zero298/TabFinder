function save_options() {
   var select = document.getElementById("caseSensitiveSelect");
   var caseSenseSetting = select.children[select.selectedIndex].value;
   localStorage["case_sensing"] = caseSenseSetting;

   var status = document.getElementById("status");
   status.innerHTML = chrome.i18n.getMessage("saveComplete");
   setTimeout(function() {
      status.innerHTML = "";
   }, 1000);
}

function restore_options() {
   var caseSettings = localStorage["case_sensing"];
   if (caseSettings === undefined) {
      return;
   }
   var select = document.getElementById("caseSensitiveSelect");
   for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value === caseSettings) {
         child.selected = "true";
         break;
      }
   }
}

function setLocaleText() {
   document.getElementById("caseSensitiveSelect_option").innerHTML =
           chrome.i18n.getMessage("caseSensitiveInstruction");
   document.getElementById("yes_option").innerHTML =
           chrome.i18n.getMessage("yesOption");
   document.getElementById("no_option").innerHTML =
           chrome.i18n.getMessage("noOption");
   document.getElementById("save").innerHTML =
           chrome.i18n.getMessage("saveButtonText");
}

document.addEventListener("DOMContentLoaded", function() {
   setLocaleText();
   restore_options();
   var saveButton = document.getElementById("save");
   saveButton.addEventListener("click", save_options);
});