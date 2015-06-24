/*jslint white: true*/
/*global document, localStorage, chrome, console, setTimeout*/

/**
 * TabFinder namespace
 * @param {Object} doc Document wrapper
 * @param {Object} locstore Local Storage wrapper
 * @param {Object} chr Chrome wrapper
 * @param {Object} consl Console wrapper
 * @param {Object} timeout Timeout wrapper
 */
(function (doc, locstore, chr, consl, timeout) {

    "use strict";

    /**
     * Function to have chrome focus a tab
     * @function focusTab
     * @memberOf TabFinder
     * @param {Event} e Some event that may have happened
     */
    function focusTab(e) {
        // If we have a keycode
        if (e && e.keyCode) {
            // Only let "enter" work
            if (e.keyCode !== 13) {
                // Otherwise just return
                return;
            }
        }
        // Make the tab selected
        chr.tabs.update(parseInt(this.dataset.tabToSwitchTo, 10), {
            selected: true
        });
    }

    /**
     * Creates a new TabSearch
     * @class TabSearch
     * @memberOf TabFinder
     * @param {HTMLElement} inputField The input field to search tabs with
     * @param {HTMLElement} resultContainer The element to put results in
     */
    function TabSearch(inputField, resultContainer) {
        /**
         * The input field that this search will use to search with
         * @member {HTMLElement} TabFinder.TabSearch#inputField
         */
        this.inputField = (inputField || null);

        /**
         * The element to put references to found tabs in
         * @member {HTMLElement} TabFinder.TabSearch#searchResultsContainer
         */
        this.searchResultsContainer = (resultContainer || null);
    }
    TabSearch.prototype = {
        /**
         * Function to initialize the TabSearch
         * @method TabFinder.TabSearch#init
         */
        init: function () {
            if (this.inputField && this.searchResultsContainer) {
                this.setLocaleText();

                // Focus on field
                this.inputField.focus();

                this.inputField.addEventListener("keydown", this.handleKeys.bind(this));
            }
            else {
                consl.log("Missing component");
            }
        },
        /**
         * Function to handle keypresses in the search box
         * @method TabFinder.handleKeys#init
         * @param {KeyboardEvent} keyEvent The keydown event
         */
        handleKeys: function (keyEvent) {
            switch (keyEvent.keyCode) {
                case 9: // Tab
                    break;
                case 38: // Up
                    break;
                case 40: //Down
                    break;
                default:
                    this.search();
                    break;
            }
        },
        /**
         * Set the locale text for the page
         * @method TabFinder.TabSearch#setLocaleText
         */
        setLocaleText: function () {
            this.inputField.labels[0].innerHTML = chr.i18n.getMessage("instruction");
        },
        /**
         * Add a result to the result container
         * @method TabFinder.TabSearch#addResult
         * @param {HTMLElement} result The result element
         */
        addResult: function (result) {
            this.searchResultsContainer.appendChild(result);
        },
        /**
         * Clear the result container
         * @method TabFinder.TabSearch#clearResultDiv
         */
        clearResultDiv: function () {
            while (this.searchResultsContainer.hasChildNodes()) {
                this.searchResultsContainer.removeChild(this.searchResultsContainer.lastChild);
            }
        },
        /**
         * Create a result div from a chrome tab
         * @method TabFinder.TabSearch#createResultDiv
         * @param {Tab} result The chrome tab found
         * @returns {HTMLElement} The tab result
         */
        createResultDiv: function (result) {
            // Create a new div
            var tabDiv = doc.createElement("div");
            // Set the class of the new div
            tabDiv.className = "foundTab";
            // Allow it to be selectable
            tabDiv.tabIndex = 0;
            // Set its content to the tabs title
            tabDiv.innerHTML = result.title;
            // Let it know what the tabs id is
            tabDiv.dataset.tabToSwitchTo = result.id;

            // Allow for users to click on the representing div to switch to it
            tabDiv.addEventListener("click", focusTab.bind(tabDiv));
            tabDiv.addEventListener("keydown", focusTab.bind(tabDiv));

            // Give back the created resultant div
            return tabDiv;
        },
        /**
         * Check the result to see if it is what we are looking for
         * @method TabFinder.TabSearch#checkResult
         * @param {Tab} result The chrome tab to check
         */
        checkResult: function (result) {
            var
                    tabTitle = result.title,
                    queryText = this.inputField.value;

            // If we don't care about case sensative, make bother lower case
            if (locstore.getItem("case_sensing") === "false") {
                queryText = queryText.toLocaleLowerCase();
                tabTitle = tabTitle.toLocaleLowerCase();
            }

            if (tabTitle.indexOf(queryText) > -1) {
                this.addResult(this.createResultDiv(result));
            }
        },
        /**
         * Check all results from the tab query
         * @method TabFinder.TabSearch#handleResults
         * @param {type} results The chrome tabs to check
         */
        handleResults: function (results) {
            results.forEach(this.checkResult.bind(this));
        },
        /**
         * Search for tabs
         * @method TabFinder.TabSearch#search
         */
        search: function () {
            // Clear our result div
            this.clearResultDiv();

            // Have Chrome get all the tabs
            chr.tabs.query({
                title: ""
            }, this.handleResults.bind(this));
        }
    };
    TabSearch.constructor = TabSearch;

    /**
     * Creates a TabOptions
     * @class TabOptions
     * @memberOf TabFinder
     * @param {HTMLElement} caseSensitiveCheckbox The case sensitive checkbox option
     * @param {HTMLElement} saveButton The options save button
     * @param {HTMLElement} statusElement Element to hold status messages
     */
    function TabOptions(caseSensitiveCheckbox, saveButton, statusElement) {
        /**
         * The input checkbox that says whether or not to be case sensitive
         * @member {HTMLElement} TabFinder.TabOptions#caseSensitiveCheckbox
         */
        this.caseSensitiveCheckbox = (caseSensitiveCheckbox || null);
        /**
         * The button that saves our options
         * @member {HTMLElement} TabFinder.TabOptions#saveButton
         */
        this.saveButton = (saveButton || null);
        /**
         * The element that will hold option status messages
         * @member {HTMLElement} TabFinder.TabOptions#statusElement
         */
        this.statusElement = (statusElement || null);
    }
    TabOptions.prototype = {
        /**
         * Function to initialize the TabOptions
         * @method TabFinder.TabOptions#init
         */
        init: function () {
            if (this.caseSensitiveCheckbox && this.saveButton && this.statusElement) {
                this.setLocaleText();
                this.restore();
                this.saveButton.addEventListener("click", this.save.bind(this));
            }
            else {
                consl.log("Missing component");
            }
        },
        /**
         * Set the locale text for the page
         * @method TabFinder.TabOptions#setLocaleText
         */
        setLocaleText: function () {
            this.caseSensitiveCheckbox.labels[0].innerHTML = chr.i18n.getMessage("caseSensitiveInstruction");
            this.saveButton.innerHTML = chr.i18n.getMessage("saveButtonText");
        },
        /**
         * Clear the options status message
         * @method TabFinder.TabOptions#clearStatus
         */
        clearStatus: function () {
            this.statusElement.innerHTML = "";
        },
        /**
         * Save our option settings
         * @method TabFinder.TabOptions#save
         */
        save: function () {
            locstore.setItem("case_sensing", this.caseSensitiveCheckbox.checked);
            this.statusElement.innerHTML = chr.i18n.getMessage("saveComplete");
            timeout(this.clearStatus.bind(this), 1000);
        },
        /**
         * Restore our option settings
         * @method TabFinder.TabOptions#restore
         */
        restore: function () {
            // Get whether we should be case sensitive or not
            var storeCaseSensitive = locstore.getItem("case_sensing");

            // Local storage stores as a string so we need to "convert" it
            if (storeCaseSensitive === "true") {
                this.caseSensitiveCheckbox.checked = true;
            }
            else {
                this.caseSensitiveCheckbox.checked = false;
            }
        }
    };
    TabOptions.constructor = TabOptions;

    /**
     * Function to initialize the program
     * @function initMain
     * @memberOf TabFinder
     */
    function initMain() {
        var
                inputField = doc.getElementById("textToSearchInput"),
                queryAnswerDiv = doc.getElementById("foundTabsDiv"),
                tabsearch = null;

        // Initialize a search handler
        tabsearch = new TabSearch(inputField, queryAnswerDiv).init();

        // Return our tabsearch
        return tabsearch;
    }

    /**
     * TabFinder options initializer
     * @function initOptions
     * @memberOf TabFinder
     */
    function initOptions() {
        var
                caseCheckbox = doc.getElementById("caseSensitiveCheckbox"),
                saveButton = doc.getElementById("saveOptionsButton"),
                statusDiv = doc.getElementById("optionsStatus"),
                taboptions = null;

        // Init tab options
        taboptions = new TabOptions(caseCheckbox, saveButton, statusDiv).init();

        // Return our taboptions
        return taboptions;
    }

    /**
     * TabFinder initializer
     * @function tabFinderInit
     * @memberOf TabFinder
     */
    function tabFinderInit() {
        doc.addEventListener('DOMContentLoaded', function () {

            var body = doc.getElementsByTagName("body");
            if (body.length > 0) {
                body = body[0];

                switch (body.id) {
                    case "tabfinder-main":
                        initMain();
                        break;
                    case "tabfinder-options":
                        initOptions();
                        break;
                    default :
                        consl.log("Unknown page");
                }
            }
        });
    }

    /**
     * TabFinder namespace
     * @namespace TabFinder
     */
    var TabFinder = {
        init: tabFinderInit
    };

    // Start the TabFinder
    TabFinder.init();

}(document, localStorage, chrome, console, setTimeout));