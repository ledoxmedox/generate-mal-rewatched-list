// ==UserScript==
// @name         Generate a List With The Animes/Mangas Titles that were Re-Watched/Re-Read forked
// @namespace    MAL Automatic Anime/Manga List Generator
// @version      0.11
// @description  This is a tool to easily and quickly generate a list with the titles of what animes/mangas you have ReWatched/ReRead and how many times.
// @author       hacker09
// @match        https://myanimelist.net/animelist/*
// @match        https://myanimelist.net/mangalist/*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://myanimelist.net&size=64
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  var $ = window.jQuery; //Defines That The Symbol $ Is A jQuery
  var nextpagenum = 0; //Create a variable to hold the page number
  var increaseby = 300; //Create a variable to Increase the list page number
  var rewatchedlistbtn = document.createElement("a"); //Creates an a element
  var TotalCompletedEntries = 0; //Create a variable to hold the Total Completed Entries Number
  var username = window.location.pathname.split('/')[2]; //Get the username on the url to use later
  var TotalReWatchedAnimes, TotalReReadMangas, type, interval, text, totalanimestwo, Condition, NEWStyle; //Make these variables global

  window.location.pathname.split('/')[1] === 'animelist' ? (type = 'anime', text = 'ReWatched Animes') : (type = 'manga', text = 'ReRead Mangas'); //Check If the user on an animelist or not and create some variables

  rewatchedlistbtn.setAttribute("id", "rewatchedlistbtn"); //Adds the id rewatchedlistbtn to the a element
  rewatchedlistbtn.setAttribute("style", "cursor: pointer;"); //Set the css for the button
  type === 'anime' ? rewatchedlistbtn.innerHTML = "Generate ReWatched List" : rewatchedlistbtn.innerHTML = "Generate ReRead List"; //Add the text on the Button

  if (document.querySelector("#advanced-options-button") === null) //Checks if the Filters button on the modern list style doesn't exist,if not then the user is using an old classic list style
  { //Starts the if condtion
    document.querySelector("a.table_headerLink").parentElement.appendChild(rewatchedlistbtn); //Defines that the 'Generate ReWatched/ReRead List' button should appear close to the 'Anime Title' or 'Manga Title' text on the old classic style list.
    rewatchedlistbtn.onclick = function() { //Detects the mouse click on the 'Generate ReWatched/ReRead List' button
      NEWStyle = false; //Add the value false to the variable NEWStyle
      loadingscreen(); //Start the loading screen function
      setTimeout(scrape, 500); //Start the scrape function
    }; //Shows a message in the console for dev purposes, and run the scrape function.Classic list styles doesn't need to be scrolled down.
  } //Finishes the if condition
  else //If the Filters button on the modern list style exists, then the user is using the modern list style
  { //Starts the else condtion
    document.querySelector("#advanced-options-button").parentElement.appendChild(rewatchedlistbtn); //Defines that the 'Generate ReWatched/ReRead List' button should appear close to the Filter button on the modern style list

    rewatchedlistbtn.onclick = async function() { //Detects the mouse click on the 'Generate ReWatched/ReRead List' button
      NEWStyle = true; //Add the value true to the variable NEWStyle
      await loadingscreen(); //Start the loading screen function

      if (Condition) //Run the codes below only if the user list has more than 300 entries
      { //Starts the if condition
        console.log('Scrolling Down. Please Wait!'); //Shows a message in the console for dev purposes
        interval = setInterval(function() { //Starts the Function that automatically "Press the keyboard key End"
          if (document.querySelectorAll("td.data.number").length !== TotalCompletedEntries) //If condition that detect if the whole list is loaded or not
          { //Starts the if condition
            window.scrollTo(0, document.body.scrollHeight); //Scrolls the website till the whole list is loaded
          } //Finishes the if condition
          else //When the whole list is loaded
          { //Starts the else condition
            console.log('Full List Loaded! Stopping Scrolling Down Now!'); //Shows a message in the console for dev purposes
            clearInterval(interval); //Breaks the timer that scrolls the page down every 0 secs
            scrape(); //Run the Scrapping Function
          } //Finishes the else condition
        }, 0); //Finishes the interval function that will run the function every 0 secs
      } //Finishes the if condition
    }; //Finishes the onclick function
  } //Finishes the else condition

  async function loadingscreen() //Creates a loading screen function that also checks if the user is on the completed list or not, and get the needed variables
  { //Starts the loadingscreen function
    var loadingScreen = document.createElement("div"); //Create a new element
    loadingScreen.setAttribute("id", "loadingScreen"); //Adds an id to the element
    loadingScreen.setAttribute("style", "background-color:rgba(0,0,0,0.75);position: fixed;width: 100%;height: 100%;top: 0;z-index: 1000;background-image: url(https://pa1.narvii.com/6258/61f5cd5c652efec508ff3c6e10798d26ccef6366_hq.gif);background-repeat: no-repeat;background-position: center;"); //Set the element css and img

    var loadingText = document.createElement("p"); //Create a new element for the text
    loadingText.innerText = "Shift + CTRL + J to check progress (console)"; //Set the text content of the element
    loadingText.setAttribute("style", "position:top;color:white;font-size:24px;text-align:center;"); //Set the element css
    loadingScreen.appendChild(loadingText); //Add the text element as a child of the loadingScreen element

    document.body.appendChild(loadingScreen); //Add the loading screen to the html body

    const response = await fetch('https://api.jikan.moe/v4/users/' + username + '/statistics'); //Fetch
    const newDocument = await response.json(); //Gets the fetch response
    TotalReWatchedAnimes = newDocument.data.anime.rewatched; //Creates a variable to hold the actual TotalReWatchedAnimes value
    TotalReReadMangas = newDocument.data.manga.reread; //Creates a variable to hold the actual TotalReReadMangas value

    if (location.href.match('\\?status=2') === null) //Checks if the user is on the completed animes/mangas tab or not
    { //Starts the if condition
      alert("Execute this on the 'Completed' page! \nRedirecting. \nTry again after the page loads."); //Show an error alert message to the user, if the user is not on an completed list
      window.location.replace(window.location.href.split('?')[0] + "?status=2"); //Redirects the user to the completed list
      throw new Error("Redirecting"); //Show an error alert message on the dev console of the user
    } //Finishes the if condition
    if ((type !== 'anime' && TotalReReadMangas === 0) || (type === 'anime' && TotalReWatchedAnimes === 0)) //If the user is already on the completed page, check whether or not the user rewatched or reread anything
    { //Starts the if condition
      location.reload(); //Reload the page
      alert('The user ' + username + ' doesn\'t have any ' + text + '!\nThe page will be reloaded!'); //Display a message
    } //Finishes the if condition
    if (NEWStyle) //Run the codes below only if the list is using the new style
    { //Starts the if condition
      if (document.querySelectorAll("td.data.number").length < 300) //Check if the user list has less than 300 entries
      { //Starts the if condition
        Condition = false; //Add the value false to the var Condition
        console.log('This user has less than 300 Completed Entries\nFull List is Already Loaded!'); //Shows a message in the console for dev purposes
        scrape(); //Run the Scrapping Function
      } //Finishes the if condition
      else //If the user list has 300 or more entries
      { //Starts the else condition
        Condition = true; //Add the value true to the var Condition
        while (true) { //Starts the while condition to get the Total Number of Entries on the user completed list
          console.log('This user has more than 300 Completed Entries\nGetting the Total Completed Entries Number...'); //Shows a message in the console for dev purposes
          const html = await (await fetch('https://myanimelist.net/' + type + 'list/' + username + '/load.json?status=2&offset=' + nextpagenum)).json(); //Fetches the user completed list
          nextpagenum += increaseby; //Increase the next page number
          totalanimestwo = html.length; //Variable to get the Total Completed Entries Number
          TotalCompletedEntries += totalanimestwo; //Sum the Total Completed Entries Number and add the result to the variable TotalCompletedEntries
          if (totalanimestwo !== 300) //If the next page has less than 300 completed entries stop looping the whlie condition
          { //Starts the if condition
            console.log('Finished Getting the Total Completed Entries Number!'); //Shows a message in the console for dev purposes
            return; //Return whether or not the fetched page has less than 300 completed entries
          } //Finishes the if condition
        } //Finishes the while condition
      } //Finishes the else condition
    } //Finishes the if condition
  } //Finishes the loadingscreen function

  function scrape() //Function that will scrape the page for rewatched/reread values
  { //Starts the function scrape
    console.log('Starting To Scrape...Please Wait!'); //Shows a message in the console for dev purposes
    var titles = []; //Creates a blank array to use latter
    var rewatches = []; //Creates a blank array to use latter
    var resultArray = []; //Creates a blank array to use latter
    var moreLinks = document.querySelectorAll('a'); //Defines a variable named 'moreLinks' that will be used to click on all the more buttons on the completed page
    var titles_old = document.querySelectorAll('div table tbody tr a.animetitle span'); //Select only the anime title on the old style list
    var titles_new = document.querySelectorAll('tbody.list-item tr.list-table-data td.data.title a.link.sort'); //Select only the anime title on the Modern default style list
    var old_list = false; //Variable that can be changed latter to the value 'true' if the user used the script on an old classic style list.The value 'false' will be kept if the user used the script on the new modern list style.
    var result = 'data:text/html;charset=utf-8,<style>html,body{font: menu;background-color: rgb(17, 17, 17);color: white;margin: 0;padding: 0;}</style><div style="max-width:650px;font-size: 18px;margin:0px auto;">'; //The HTML and CSS that will be added to the final output



    
    if (titles_old.length > titles_new.length) //Checks if the user list style is the old classic style or the new modern style
    { //Starts the if condition
      titles = titles_old; //If the user used the script on an old classic list style, the titles will be added to the titles array
      old_list = true; //Variable old_list will be changed to the value 'true' if the user used the script on an old classic style list
    } //Finishes the if condition
    else //If the user used the script on a new modern list style
    { //Starts the else condition
      for (var i = 0; i < titles_new.length; i++) //This for condition is responsible for getting all the anime titles
      { //Starts the for condition
        titles[i] = titles_new[i].text; //Add all titles to an array
      } //Finishes the for condition
    } //Finishes the else condition

    result += "<h1> " + username + " " + text + " List</h1>"; //h1 element that will be added to the final HTML and CSS output
    if (type == "anime") //If the type is anime
    { //Starts the if condition
      result += "<h3><em>List of Animes that " + username + " has watched and ReWatched:</em></h3>"; //If the type is anime then add 'How many times username has watched and ReWatched' to The HTML and CSS that will be added to the output when the script is done
    } //Finishes the if condition
    else //If the type is manga
    { //Finishes the else condition
      result += "<h3><em>List of Mangas that " + username + " has read and ReRead:</em></h3>"; //If the type is manga then add ''How many times username has read and ReRead' to The HTML and CSS that will be added to the output when the script is done
    } //Finishes the else condition

    if (old_list) //If the script is working on an old classic list style
    { //Starts the if condition
      //The 12 lines below Fetches the rewatch count information bypassing the 'More' link on old classic list styles
      $("div.hide").each(function(index, value) {
        var series_id = $(value).attr('id').split('more')[1];
        $.post("/includes/ajax-no-auth.inc.php?t=6", {
          color: 1,
          id: series_id,
          memId: $('#listUserId').val(),
          type: $('#listType').val()
        }, function(data) {
          if (type == "anime") rewatches[index] = $(data.html).find('strong')[0].innerHTML; //If the type is anime start scrapping the anime rewatched values
          if (type == "manga") //If the type is anime start scrapping the manga 'Times Read' values
          { //Starts the if condition
            var moreSection = $(data.html).find('td').html(); //Opens the more button on old classic style list
            var timesReadIndex = moreSection.indexOf("Times Read"); //Detects how many times a manga was read
            rewatches[index] = moreSection.charAt(timesReadIndex + 12);
          } //Finishes the if condition
        }, "json"); //The scrapping isn't done using HTML,it's done by scrapping only the json file that's loaded when the user goes down (loads more animes/mangas) ('XHR Get' Method)
      }); //Finishes the each condition
    } //Finishes the if condition
    else //If the script was run on a new modern list style
    { //Starts the else condition
      console.log('Opening And Scraping All "More" Buttons.Please Wait!'); //Shows a message in the console for dev purposes
      //The 6 lines Below Will Click all links labeled 'More' to get the rewatch counts later on the page
      for (i = moreLinks.length; i--;) { //Starts the for condition
        if (moreLinks[i].innerHTML == 'More') { //If the moreLinks variable has the text More
          moreLinks[i].click(); //Click on the moreLinks button
        } //Finishes the if condition
      } //Finishes the for condition
    } //Finishes the else condition

    document.querySelector("head").innerHTML = "<title>Almost Done...</title>"; //Change the tab title
    console.log('Almost Done...'); //Shows a message on the console for dev purposes

    wait(); //Repeats every 1 second until all More-sections are processed

    function wait() //Creates the wait function
    { //Starts the function wait
      if (type == "manga" && document.querySelector("#advanced-options-button") !== null) //If the list type is manga and it's using the Modern Style
      { //Starts the if condition
        for (var i = document.querySelectorAll("td.td1.borderRBL").length; i--;) { //For condition to make the ReRead values bold, otherwise the script won't detect ReRead Mangas
          document.querySelectorAll("td.td1.borderRBL")[i].outerHTML = "Times Read:" + "<strong>" + document.querySelectorAll("td > br:nth-child(8)")[i].nextSibling.textContent.replace(/[^0-9]+/g, ""); + "</strong>"; //Make the ReRead values bold
        } //Finishes the for condition
      } //Finishes the if condition
      setTimeout(function() //Creates the timeout function
        { //Starts the timeout function
          if (!old_list) rewatches = document.querySelectorAll('tbody.list-item tr.more-info strong'); //If the script was run on an new modern list style then use this command to set the variable rewatches
          if (rewatches.length != titles.length) //Check if All sections were or not opened
          { //Starts the if condition
            wait(); //If All sections were not opened check it again after 1 seconds
          } //Finishes the if condition
          else //If All sections were opened
          { //Starts the else condition
            if (old_list) //Check if the script was run in an old classic list style or not
            { //Starts the if condition
              for (var i = 0; i < titles.length; i++) {
                //Parse rewatched shows into an array of arrays with rewatch count as index and add them to the downloaded file when the script is done
                if (rewatches[i] > 0) {
                  if (resultArray[rewatches[i]]) {
                    resultArray[rewatches[i]] = resultArray[rewatches[i]].concat("<a href=" + titles[i].parentElement.href + " target='_blank' style='text-decoration: none;color: rgb(255, 255, 255);'>" + "<li onmouseover='this.style.color=\"silver\"' onmouseout='this.style.color=\"white\"'>" + titles[i].textContent + "</li></a>");
                  } else { //Starts the else condition
                    resultArray[rewatches[i]] = "<b>" + (parseInt(rewatches[i]) + 1) + " times:</b>"; //+1 shows the total watched times number. -1 shows the total Re-Watched times only.
                    resultArray[rewatches[i]] = resultArray[rewatches[i]].concat("<ul>");
                    resultArray[rewatches[i]] = resultArray[rewatches[i]].concat("<a href=" + titles[i].parentElement.href + " target='_blank' style='text-decoration: none;color: rgb(255, 255, 255);'>" + "<li onmouseover='this.style.color=\"silver\"' onmouseout='this.style.color=\"white\"'>" + titles[i].textContent + "</li></a>");
                  } //Finishes the else condition
                } //Finishes the if condition
              } //Finishes the for condition
            } //Finishes the if condition
            else //If the script was run in on the new default modern list style
            { //Starts the else condition
              for (i = 0; i < titles.length; i++) {
                //Parse rewatched shows into an array of arrays with rewatch count as index
                if (rewatches[i].innerHTML > 0) {
                  if (resultArray[rewatches[i].innerHTML]) {
                    resultArray[rewatches[i].innerHTML] = resultArray[rewatches[i].innerHTML].concat("<a href=" + titles_new[i].href + " target='_blank' style='text-decoration: none;color: rgb(255, 255, 255);'>" + "<li onmouseover='this.style.color=\"silver\"' onmouseout='this.style.color=\"white\"'>" + titles[i].trim() + "</li></a>");
                  } //Finishes the if condition
                  else { //Starts the else condition
                    resultArray[rewatches[i].innerHTML] = "<b>" + (parseInt(rewatches[i].innerHTML) + 1) + " times:</b>"; //+1 shows the Re-Watched/Re-Read and the watched/read total numbers. -1 shows only the total times an anime/manga was Re-Watched/Re-Read.
                    resultArray[rewatches[i].innerHTML] = resultArray[rewatches[i].innerHTML].concat("<ul>"); //Adds the divisories (div like html tags) between rewatched/reread numbers, and concatenates them
                    resultArray[rewatches[i].innerHTML] = resultArray[rewatches[i].innerHTML].concat("<a href=" + titles_new[i].href + " target='_blank' style='text-decoration: none;color: rgb(255, 255, 255);'>" + "<li onmouseover='this.style.color=\"silver\"' onmouseout='this.style.color=\"white\"'>" + titles[i].trim() + "</li></a>"); //Adds the rewatched/reread titles inside the tags <li> , and concatenates them
                  } //Finishes the else condition
                } //Finishes the if condition
              } //Finishes the for condition
            } //Finishes the else condition

            resultArray.reverse(); //This command makes the final list output be organized by starting the list with the most rewatched/reread values, if this line is removed, the output list will start with animes rewatched once and the last animes on the list will be the most rewatched/reread ones.
            resultArray.forEach(function(value, index, array) {
              result += value.concat("</ul>");
            });

            document.querySelector("body").insertAdjacentHTML('beforebegin', "<a style='position: absolute; left:0px;'>'Total Entries Processed: " + rewatches.length + " X Total Entries: " + titles.length + "</a>"); //Create an a element
            document.querySelector("body").insertAdjacentHTML('beforebegin', "<a id='dwnldLnk' style='margin-left: 1200px;' download='" + username + " ReWatched_ReRead List!' title='" + username + " ReWatched_ReRead List!.html'>Download List</a>"); //Create and show the download button
            document.getElementById('dwnldLnk').href = result; //Adds the scrapped results as a link on the a element
            document.querySelector("body").insertAdjacentHTML('beforebegin', "<a href='https://myanimelist.net/profile/" + username + "' style='margin-inline-start: -700px;'>Return To User Profile</a>"); //Creates and show an a element on the screen

            document.querySelector("head").innerHTML = "<title>Done! List Generated!</title>"; //Change the tab title
            console.log('Done! Showing The Results Page!'); //Shows a message in the console for dev purposes
            document.querySelector("body").innerHTML = result.replace('data:text/html;charset=utf-8,', '');
            window.scrollTo(0, 0); //Scroll the page to the top
          } //Finishes the else condition
        }, 1000); //Finishes the settimeout function.Wait 1 second
    } //Finishes the function wait
  } //Finishes the scrape function
})(); //Finishes the tampermonkey function