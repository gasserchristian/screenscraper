const express = require('express');
const app = express();
const axios = require('axios');
const fs = require('fs');
const puppeteer = require('puppeteer-core')
const Progress = require('progressbar')

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/images', express.static('images'))
app.get('/images',(req,res)=>{
  var files = fs.readdirSync('./images').map(d=>`<li><a href="${d}">${d}</a></li>`)
  res.send(`<ul>${files.join('')}</ul>`)
})

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
  <head>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ScreenScraper</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>">
  </head>
<body class="bg-gray-100 h-screen">
<div class="ribbon">
<div class="tabs flex overflow-x-auto whitespace-nowrap bg-gray-200">
    <button onclick="changeTab(this)" class="inline-flex items-center h-12 px-2 py-2 text-center text-gray-700 bg-transparent border-b border-gray-300 sm:px-4 dark:border-gray-500 -px-1 dark:text-white whitespace-nowrap cursor-base focus:outline-none hover:border-gray-400 dark:hover:border-gray-300">
        <span class="mx-1 text-sm sm:text-base">
            OSM
        </span>
    </button>

    <button onclick="changeTab(this)" class="inline-flex items-center h-12 px-2 py-2 text-center text-gray-700 bg-transparent border-b border-gray-300 sm:px-4 dark:border-gray-500 -px-1 dark:text-white whitespace-nowrap cursor-base focus:outline-none hover:border-gray-400 dark:hover:border-gray-300">
        <span class="mx-1 text-sm sm:text-base">
            Wikidata
        </span>
    </button>
    <button onclick="changeTab(this)" class="inline-flex items-center h-12 px-2 py-2 text-center text-gray-700 border border-b-0 border-gray-300 sm:px-4 dark:border-gray-500 dark:text-white whitespace-nowrap focus:outline-none">
        <span class="mx-1 text-sm sm:text-base">
            Scrap
        </span>
    </button>

    <div class="flex-grow h-12 border-b border-gray-300 sm:px-4 dark:border-gray-500"></div>
</div>
<section class="w-full flex items-center bg-gray-200 p-4 rounded-lg shadow-md flex-col md:flex-row" style="display:none">
  <input type="text" class="md:mr-1 mr-0 mb-1 md:mb-1 flex-1 rounded-lg py-2 px-4 leading-5 bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:shadow-outline-blue-300 focus:border-blue-300 transition duration-150 ease-in-out" placeholder="wikidata ID" id="regionID">
  <input type="text" class="md:mr-1 mr-0 mb-1 md:mb-1 flex-1 rounded-lg py-2 px-4 leading-5 bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:shadow-outline-blue-300 focus:border-blue-300 transition duration-150 ease-in-out" placeholder="tag" id="tagCombination">
  <input type="text" class="md:mr-1 mr-0 mb-1 md:mb-1 flex-1 rounded-lg py-2 px-4 leading-5 bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:shadow-outline-blue-300 focus:border-blue-300 transition duration-150 ease-in-out" placeholder="file name" id="fileName">
  <button onclick="sendOSMRequest()" type="button" class="flex float-right px-4 py-2 font-semibold leading-5 text-white bg-green-500 rounded-lg shadow-md hover:bg-green-400 focus:outline-none focus:bg-green-400 transition duration-150 ease-in-out">
    <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
    Send
  </button>
</section>
<section class="w-full flex items-center bg-gray-200 p-4 rounded-lg shadow-md flex-col md:flex-row" style="display:none">
  <input type="text" class="md:mr-1 mr-0 mb-1 md:mb-1 flex-1 rounded-lg py-2 px-4 leading-5 bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:shadow-outline-blue-300 focus:border-blue-300 transition duration-150 ease-in-out" placeholder="first predictor" id="predictorA">
  <input type="text" class="md:mr-1 mr-0 mb-1 md:mb-1 flex-1 rounded-lg py-2 px-4 leading-5 bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:shadow-outline-blue-300 focus:border-blue-300 transition duration-150 ease-in-out" placeholder="second predictor" id="predictorB">
  <input type="text" class="md:mr-1 mr-0 mb-1 md:mb-1 flex-1 rounded-lg py-2 px-4 leading-5 bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:shadow-outline-blue-300 focus:border-blue-300 transition duration-150 ease-in-out" placeholder="limit" id="limit">
  <input type="text" class="md:mr-1 mr-0 mb-1 md:mb-1 flex-1 rounded-lg py-2 px-4 leading-5 bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:shadow-outline-blue-300 focus:border-blue-300 transition duration-150 ease-in-out" placeholder="file name" id="fileNameWikidata">
  <button onclick="sendWikidataRequest()" type="button" class="flex float-right px-4 py-2 font-semibold leading-5 text-white bg-green-500 rounded-lg shadow-md hover:bg-green-400 focus:outline-none focus:bg-green-400 transition duration-150 ease-in-out">
    <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
    Send
  </button>
</section>
<section class="scrap flex items-center bg-gray-200 p-4 py-0 rounded-lg shadow-md flex-col md:flex-row">
  <div class="py-4 pr-4">
    <input type="checkbox" id="fullPage" name="fullPage" checked>
    <label for="fullPage">Full page</label>
  </div>
<div>
<input type="radio" id="tablet" name="device" class="hidden" value="tablet" checked />
<label for="tablet" class="cursor-pointer hover:bg-blue-100 h-16 float-left p-2">
  <svg class="h-full" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="70.87 94.96 353.6 498.96">
  <path fill="#454545" d="M414.59 101.24c-3.13-2.49-6.68-3.91-10.64-4.24-.09-1.36-.85-2.04-2.28-2.04h-18.48c-1.42 0-2.19.65-2.32 1.96H91.31c-4.79 0-8.99 1.44-12.6 4.32h.04c-.65.52-1.28 1.08-1.88 1.68-4 4-6 8.84-6 14.52V573.4c0 5.58 1.96 10.35 5.88 14.32.02.08.06.15.12.2 4 4 8.81 6 14.44 6h310.68c5.63 0 10.44-2.03 14.44-6.08 4-4 6-8.81 6-14.44l.08-380.28c1.31-.1 1.96-.86 1.96-2.28V172.2c0-1.4-.65-2.16-1.96-2.28v-5.48c1.31-.1 1.96-.87 1.96-2.32v-18.48c0-1.4-.65-2.16-1.96-2.28l-.08-23.92c0-5.68-2-10.52-6-14.52a26.32 26.32 0 0 0-1.84-1.68m-4.84.68c1.6.81 3.08 1.89 4.44 3.24 3.41 3.36 5.12 7.46 5.12 12.28V573.4c0 4.8-1.68 8.86-5.04 12.2-3.39 3.41-7.48 5.12-12.28 5.12H91.31c-4.74 0-8.81-1.71-12.2-5.12-3.41-3.34-5.12-7.4-5.12-12.2V117.44c0-4.82 1.71-8.92 5.12-12.28 1.36-1.35 2.84-2.43 4.44-3.24 2.33-1.17 4.92-1.76 7.76-1.76h310.68c2.84 0 5.43.59 7.76 1.76M255.67 579l.04-.04c2.21-2.21 3.32-4.88 3.32-8 0-3.15-1.12-5.84-3.36-8.08-2.21-2.21-4.88-3.32-8-3.32-3.15 0-5.84 1.11-8.08 3.32-2.21 2.24-3.32 4.93-3.32 8.08 0 3.12 1.11 5.79 3.32 8 2.24 2.24 4.93 3.36 8.08 3.36 3.12 0 5.79-1.11 8-3.32m-1-15.12c1.95 1.95 2.92 4.31 2.92 7.08 0 2.72-.97 5.06-2.92 7-1.95 1.92-4.28 2.88-7 2.88-2.77 0-5.13-.96-7.08-2.88-1.95-1.92-2.92-4.25-2.92-7s.97-5.11 2.92-7.08c1.95-1.95 4.31-2.92 7.08-2.92 2.75-.01 5.08.97 7 2.92m-9.36-445.32c-.59.56-.88 1.25-.88 2.08 0 .83.3 1.52.88 2.08.56.59 1.25.88 2.08.88.83 0 1.52-.28 2.08-.84l.04-.04c.56-.56.84-1.25.84-2.08 0-.83-.29-1.52-.88-2.08-.56-.59-1.25-.88-2.08-.88-.83 0-1.52.29-2.08.88m.56 2.08c0-.43.13-.79.4-1.08l.04-.04c.29-.27.65-.4 1.08-.4.45 0 .8.13 1.04.4.32.32.48.69.48 1.12 0 .4-.16.75-.48 1.04-.29.32-.64.48-1.04.48-.43 0-.8-.16-1.12-.48-.27-.24-.4-.59-.4-1.04m155.76 21.84c0-1.39-.69-2.08-2.08-2.08H94.59c-1.33-.01-2 .69-2 2.08v406.8c0 1.4.67 2.09 2 2.08h304.96c1.39 0 2.08-.69 2.08-2.08v-406.8m-75.64.16h73.44V549.08H94.79V142.64H312.27z"/>
  </svg>
</label>
<input type="radio" id="phone" name="device" class="hidden" value="phone" />
<label for="phone" class="cursor-pointer hover:bg-blue-100 pl-1 h-16 float-left">
  <svg class="h-full" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 255.12 453.54">
  <path fill="#454545" d="M38.04 129.29c-1.65.11-2.48 1.04-2.48 2.8v8.64c0 1.71.82 2.61 2.48 2.72l-.08 12.04c-1.6.14-2.4 1.07-2.4 2.8v18.16c0 1.73.8 2.65 2.4 2.76v4c-1.6.14-2.4 1.07-2.4 2.8v18.16c0 1.73.8 2.65 2.4 2.76l.08 167.76c0 6.94 2.47 12.87 7.4 17.8 4.93 4.93 10.88 7.4 17.84 7.4h98.64c6.94 0 12.88-2.47 17.84-7.4 4.93-4.93 7.4-10.86 7.4-17.8V179.21c1.57-.11 2.36-1.03 2.36-2.76v-18.16c0-1.73-.79-2.66-2.36-2.8v-40.48c0-6.99-2.47-12.95-7.4-17.88-4.96-4.93-10.9-7.4-17.84-7.4H63.28c-6.96 0-12.91 2.47-17.84 7.4s-7.4 10.89-7.4 17.88v14.28m9.16-30.36c4.43-4.43 9.79-6.64 16.08-6.64h98.64c6.27 0 11.63 2.21 16.08 6.64 4.4 4.46 6.6 9.81 6.6 16.08v259.68c0 6.27-2.2 11.6-6.6 16-4.45 4.45-9.81 6.68-16.08 6.68H63.28c-6.29 0-11.65-2.23-16.08-6.68-4.43-4.4-6.64-9.73-6.64-16V115.01c0-6.27 2.21-11.62 6.64-16.08"/>
  <path fill="#343333" d="M120.12 369.09c-2.19-2.21-4.85-3.32-8-3.32-3.09 0-5.76 1.11-8 3.32-2.21 2.22-3.32 4.88-3.32 8 0 3.09 1.11 5.75 3.32 7.96 2.24 2.24 4.91 3.36 8 3.36 3.15 0 5.81-1.1 8-3.32v-.04c2.21-2.21 3.32-4.87 3.32-7.96 0-3.12-1.11-5.78-3.32-8m-15 1h.08c1.9-1.94 4.2-2.92 6.92-2.92 2.77 0 5.11.98 7 2.92 1.92 1.92 2.88 4.25 2.88 7 0 2.72-.96 5.04-2.88 6.96-1.95 1.95-4.28 2.92-7 2.92-2.72 0-5.05-.97-7-2.92-1.89-1.92-2.84-4.24-2.84-6.96 0-2.72.95-5.05 2.84-7m5.76-270.44v.08c-.48.45-.72 1.01-.72 1.68 0 .67.24 1.24.72 1.72.51.48 1.09.72 1.76.72.67 0 1.24-.21 1.72-.64v-.08c.48-.48.72-1.05.72-1.72 0-.67-.24-1.25-.72-1.76-.48-.48-1.05-.72-1.72-.72-.67 0-1.25.24-1.76.72m2.48 1.04c.21.21.32.45.32.72 0 .29-.11.53-.32.72v.04c-.21.19-.45.28-.72.28-.29 0-.53-.11-.72-.32a.972.972 0 0 1-.28-.72c0-.27.09-.49.28-.68v-.04c.21-.19.45-.28.72-.28.29 0 .53.09.72.28m-21.56 8.2c-.56-.56-1.25-.84-2.08-.84-.83 0-1.53.28-2.12.84-.56.61-.84 1.31-.84 2.08 0 .83.28 1.53.84 2.12.59.56 1.29.84 2.12.84.83 0 1.52-.28 2.08-.84.59-.59.88-1.29.88-2.12 0-.77-.29-1.47-.88-2.08m-.56 2.08c0 .45-.15.83-.44 1.12-.29.3-.65.44-1.08.44-.45 0-.83-.15-1.12-.44-.27-.29-.4-.67-.4-1.12 0-.4.13-.75.4-1.04h.04c.32-.32.68-.48 1.08-.48.43 0 .79.16 1.08.48.29.3.44.64.44 1.04m8.16-.28v.36c0 .59.21 1.08.64 1.48.45.45.97.68 1.56.68h22.08c.59 0 1.08-.2 1.48-.6l.08-.08c.4-.4.6-.89.6-1.48v-.36c0-.59-.23-1.09-.68-1.52-.4-.4-.89-.6-1.48-.6H101.6c-.59 0-1.09.19-1.52.56l-.04.04c-.43.43-.64.93-.64 1.52m1.68-.48c.13-.16.31-.24.52-.24h22.08c.21 0 .37.08.48.24.16.11.24.27.24.48v.36c0 .19-.05.35-.16.48l-.08.08a.77.77 0 0 1-.48.16H101.6c-.21 0-.4-.08-.56-.24-.11-.11-.16-.27-.16-.48v-.36c0-.19.05-.35.16-.48h.04m-54.36 17.16c-.24.21-.36.47-.36.8v231.08c-.01.29.1.53.32.72.02.03.04.04.04.04.22.24.47.37.76.36h130.8c.31.01.56-.13.76-.4.04-.01.06-.04.08-.08l.24-.48c.03-.04.04-.1.04-.16V128.17c0-.32-.12-.59-.36-.8l-.04-.04a.972.972 0 0 0-.72-.28H47.48c-.29 0-.54.09-.76.28v.04m1.52 1.48H177.52v229.64H48.24V128.85z"/>
  </svg>
</label>
<input type="radio" id="notebook" name="device" class="hidden" value="notebook" />
<label for="notebook" class="cursor-pointer hover:bg-blue-100 h-16 p-3 float-left">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-full" viewBox="0 0 59.703 34.529">
  <g stroke="#000" transform="matrix(.26458 0 0 .26458 105.628 -79.64)">
    <path d="M-203 302.5c4.1 0 7.5 3.4 7.5 7.5v106c0 4.1-3.4 7.5-7.5 7.5-.3 0-.5.2-.5.5s.2.5.5.5c4.7 0 8.5-3.8 8.5-8.5V310c0-4.7-3.8-8.5-8.5-8.5h-10c-.3 0-.5.2-.5.5s.2.5.5.5zM-368 301.5c-4.7 0-8.5 3.8-8.5 8.5v106c0 4.7 3.8 8.5 8.5 8.5.3 0 .5-.2.5-.5s-.2-.5-.5-.5c-4.1 0-7.5-3.4-7.5-7.5V310c0-4.1 3.4-7.5 7.5-7.5h10c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z" class="st0"/>
    <path d="m-203 311.2-.2 105.8-163.8-.2.2-105.8ZM-367.2 417l164.2.2.2-106.2-164.2-.2ZM-368 301.5h165v1h-165z" class="st0"/>
    <circle cx="-285" cy="307" r="1" class="st0"/>
    <path d="m-268 424.2-.2-.2v1.5c0 .7-.6 1.3-1.3 1.3h-32c-.7 0-1.3-.6-1.3-1.3V424l-.2.2zm-35.2-.4v1.7c0 .9.8 1.7 1.7 1.7h32c.9 0 1.7-.8 1.7-1.7v-1.7H-303z" class="st0"/>
    <path d="M-397 424.5v-1h221v1zM-368 430h165v1h-165z" class="st0"/>
    <path d="M-397.9 423.5h-.4l-.1.4v.3c-.1 1.1 0 2.3.5 3.5.2.4.4.8.7 1.1.6.8 1.5 1.3 2.7 1.7.7.2 1.4.4 2.2.4.3 0 .5 0 .7.1h26.2v-1h-25.9c-.2 0-.5 0-.9-.1-.7-.1-1.4-.2-2-.4-1-.3-1.8-.8-2.2-1.4-.2-.3-.4-.6-.5-.9-.4-1-.5-2-.4-2.9v-.2l-.5.4h29.4v-1zM-175 424.5l-.5-.4v.2c.1.9 0 2-.4 2.9-.1.3-.3.6-.5.9-.4.6-1.2 1-2.2 1.4-.6.2-1.3.3-2 .4-.4 0-.7.1-.9.1H-207v1h25.8c.2 0 .5 0 .7-.1.7-.1 1.5-.2 2.2-.4 1.2-.4 2.1-.9 2.7-1.7.3-.4.5-.7.7-1.1.5-1.2.6-2.4.5-3.5v-.3l-.1-.4h-28.4v1z" class="st0"/>
  </g>
</svg>
</label>
<style>
.scrap [type='radio']:checked + label {
  background: rgb(243,244,246);
}
</style>
</div>
<input type="text" class="md:ml-1 ml-0 mb-1 md:mb-1 flex-1 rounded-lg py-2 px-4 leading-5 bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:shadow-outline-blue-300 focus:border-blue-300 transition duration-150 ease-in-out" placeholder="image name" id="imgName">
<div class="clear-both"></div>
</section>
</div>

<p id="response"></p>

<div id="dialog" class="hidden fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 p-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <textarea id="json-file" class="w-full h-32"></textarea>
      <div class="flex justify-between items-center mt-6">
        <button class="btn btn-green" id="save-json">
          Save
        </button>
        <button onclick="closeDialog()">
          <svg viewBox="0 0 20 20" class="w-6 h-6">
            <path
              d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  
  <template id="fileRow">
      <li class="flex justify-between px-4 py-4 my-2 rounded-lg shadow-md bg-white">
        <span class="mr-auto font-bold name"></span>
        <button class="text-red-500 hover:text-red-700 btn-showDialog">
        <svg class="h-6 w-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><g transform="matrix(.02146 0 0 .02146 1 1)" fill="#4d4d4d"><path d="m466.07 161.53c-205.6 0-382.8 121.2-464.2 296.1-2.5 5.3-2.5 11.5 0 16.9 81.4 174.9 258.6 296.1 464.2 296.1 205.6 0 382.8-121.2 464.2-296.1 2.5-5.3 2.5-11.5 0-16.9-81.4-174.9-258.6-296.1-464.2-296.1m0 514.7c-116.1 0-210.1-94.1-210.1-210.1 0-116.1 94.1-210.1 210.1-210.1 116.1 0 210.1 94.1 210.1 210.1 0 116-94.1 210.1-210.1 210.1"/><circle cx="466.08" cy="466.02" r="134.5"/></g></svg>
        </button>
        <button class="text-red-500 hover:text-red-700 btn-deleteFile">
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 2l2-2h4l2 2h4v2H2V2h4zM3 6h14l-1 14H4L3 6zm5 2v10h1V8H8zm3 0v10h1V8h-1z"/>
        </svg>
        </button>
        <button class="hover:text-green-400 text-green-500 btn-launchScrap">
        <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M8 5v14l11-7z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
        </button>
        <button class="text-blue-500 hover:text-blue-700">
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z"/>
        </svg>
        </button>
      </li>
  </template>
<script>
    function launchScrap(name,el){
      const p = document.createElement('progress')
      p.max = 1
      p.value = 0
      p.innerText = '0 %'
      el.append(p)
      const fullPage = document.querySelector('#fullPage').checked
      const prefix = document.querySelector('#imgName').value
      const device = document.querySelector('input[name="device"]:checked').value
      const eventSource = new EventSource('/scrap/' + encodeURIComponent(name)+'?device='+device+'&fullPage='+fullPage+'&prefix='+prefix);
      eventSource.onmessage = (event) => {
        p.value = event.data;
        p.innerText = event.data + '%'
      };
    }
    function showDialog(name) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/links/' + encodeURIComponent(name));
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send();
        xhr.onload = () => {
            document.querySelector('#json-file').value = xhr.responseText
            document.getElementById("dialog").classList.remove("hidden");
            document.getElementById("save-json").onclick = d=>save(name)
        };
    }
    function closeDialog() {
      document.getElementById("dialog").classList.add("hidden");
    }
    function save(name) {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', '/links/' + encodeURIComponent(name));
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      var data = "json="+encodeURIComponent(document.querySelector('#json-file').value);
      xhr.send(data);
      xhr.onload = () => {
          alert("Saved!");
      };
      // Add your save functionality here
      closeDialog();
    }

function changeTab(el) {
var tabs = document.querySelectorAll('.ribbon .tabs button'),
    sections = document.querySelectorAll('.ribbon section'),
    index = [].indexOf.call(tabs,el)
sections.forEach(d=>d.style.display='none')
sections[index].style.display = 'flex'
classListSelectedTab = "inline-flex items-center h-12 px-2 py-2 text-center text-gray-700 border border-b-0 border-gray-300 sm:px-4 dark:border-gray-500 dark:text-white whitespace-nowrap focus:outline-none"
classListOtherTabs = "inline-flex items-center h-12 px-2 py-2 text-center text-gray-700 bg-transparent border-b border-gray-300 sm:px-4 dark:border-gray-500 -px-1 dark:text-white whitespace-nowrap cursor-base focus:outline-none hover:border-gray-400 dark:hover:border-gray-300"
tabs.forEach(d=>d.classList.value=classListOtherTabs)
el.classList.value = classListSelectedTab
}
getLinkFiles()
function createRowTemplate(name) {
  const template = document.querySelector('#fileRow').content.cloneNode(true),
        rowItem = template.firstElementChild,
        launch = template.querySelector('.btn-launchScrap'),
        remove = template.querySelector('.btn-deleteFile'),
        show = template.querySelector('.btn-showDialog')
  rowItem.id = name.replace(/[.]/g, "-")
  template.querySelectorAll('span')[0].textContent = name
  show.onclick = d=>showDialog(name)
  launch.onclick = d=>launchScrap(name,rowItem)
  remove.onclick = d=>deleteFile(name,rowItem)
  return template
}
function getLinkFiles() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/links');
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      const rows = JSON.parse(xhr.responseText).map(d=>createRowTemplate(d)),
            ul = document.createElement('ul')
      ul.classList.add("list-none","m-2","bg-white","fileList")
      rows.forEach(d=>ul.appendChild(d))
      document.getElementById("response").appendChild(ul)
    }
  }
  xhr.send()
}
function deleteFile(name,li) {
    if (confirm("Delete item?") == true) {
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', '/links/' + encodeURIComponent(name));
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
    xhr.onload = () => {
        li.remove()
    };
    }
}
function insertRowAlphabetically(name) {
  const ul = document.querySelector('.fileList'),
        filename = name+'.json',
        row = createRowTemplate(filename),
        id = filename.replace(/[.]/g, "-")

  // Find the correct position to insert the new item
  let currentItem = ul.firstElementChild;
  while (currentItem && currentItem.id < id) {
    currentItem = currentItem.nextElementSibling;
  }
  ul.insertBefore(row, currentItem);
}
function sendOSMRequest() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      insertRowAlphabetically(name)
    }
  }
  var id = document.getElementById('regionID').value;
  var tag = document.getElementById('tagCombination').value;
  var name = document.getElementById('fileName').value;
  xhr.open('POST', '/overpass', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  var data = "id=" + encodeURIComponent(id) + "&tag=" + encodeURIComponent(tag)+"&filename="+encodeURIComponent(name);
  xhr.send(data);
}
function sendWikidataRequest() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      insertRowAlphabetically(name)
    }
  }
  var predictorA = document.getElementById('predictorA').value,
      predictorB = document.getElementById('predictorB').value,
      limit = document.getElementById('limit').value,
      name = document.getElementById('fileNameWikidata').value;
  xhr.open('POST', '/wikidata', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  var data = "pA=" + encodeURIComponent(predictorA) + "&pB=" + encodeURIComponent(predictorB)+"&limit="+encodeURIComponent(limit)+"&filename="+encodeURIComponent(name);
  xhr.send(data);
}
</script>

</body>
</html>
    `);
});

app.post('/overpass', (req, res) => {
  const query = `
    [out:json][timeout:25];
    area[wikidata="${req.body.id}"]->.searchArea;
    (
    nwr[${req.body.tag}][website](area.searchArea);
    );
    out meta;
    `;

  axios.get(`https://overpass-api.de/api/interpreter`, {
    params: {
      data: query
    },
  }).then((response) => {
    let links = response.data.elements.map(d => d.tags.website)
    console.log(`There are ${links.length} links`)
    res.send('downloaded')
    writeFile(links, req.body.filename)
  }).catch((error) => {
    console.error(error);
  });
});

app.post('/wikidata', (req, res) => {
  const endpointUrl = 'https://query.wikidata.org/sparql';
  const sparqlQuery = `
  SELECT DISTINCT ?website
  WHERE
  {
    ${req.body.pA}
    ${req.body.pB}
    ?item wdt:P856 ?website.
  } ${req.body.limit}`;
  axios.get(endpointUrl, {
    params: {
      format: 'json',
      query: sparqlQuery
    },
  }).then((response) => {
    let links = response.data.results.bindings.map(d => d.website.value)
    console.log(`Got ${links.length} links`)
    res.send('downloaded')
    writeFile(links, req.body.filename)
  }).catch((error) => {
    console.error(error);
  });
});

function writeFile(data, name) {
    data = JSON.stringify(data)
    var file = fs.createWriteStream(`links/${name}.json`);
    file.write(data)
    file.end();
}

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

app.get('/links', (req, res) => {
    let links = fs.readdirSync('./links')
    console.log(req.body)
    res.send(JSON.stringify(links, null, 2))
});

app.get('/links/:name', (req, res) => {
    fs.readFile(`links/${req.params.name}`,(err, data) => {
        res.send(data)
    });
});

app.delete('/links/:name', (req, res) => {
    fs.unlinkSync('links/'+req.params.name)
    res.send('deleted')
});

app.put('/links/:name', (req, res) => {
  fs.writeFile(`links/${req.params.name}`,req.body.json,(err,data)=>{
    res.send('saved')
  })
});

app.get('/scrap/:name', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  req.on('close', () => {
    // clearInterval(timer);
  });
  launchVisualScraping(
    `${req.params.name}`,
    progress => res.write(`data: ${progress}\n\n`),
    req.query.device,
    req.query.fullPage=='true',
    req.query.prefix
  )
});

function launchVisualScraping(file,log,device,fullPage,prefix){
  (async () => {
    console.log(file)
    links = JSON.parse(fs.readFileSync(`links/${file}`, { encoding: "utf8" }))
    progress = Progress.create().step('Make screenshots');
    progress.setTotal(links.length)
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      headless: true,
    });
    switch (device) {
      case 'phone':
        width = 414
        height = 896
        break;
      case 'notebook':
        width = 1920
        height = 1080
        break;
      case 'tablet':
        width = 1024
        height = 1366
        break;
      default:
        width = 1920
        height = 1080
    }

  })().then(d => {
    links.forEach(function (d, i) {
      setTimeout(() => { makeScreenshot(d, i, progress, log, fullPage, width, height, prefix) }, i * 20000)
    })
  })
}

function makeScreenshot(d, i, progress, log, fullPage, width, height, prefix) {
  (async () => {
    console.log(d)
    const page = await browser.newPage();
    await page.goto(d);
    await page.setViewport({ width: width, height: height, deviceScaleFactor: 1 })
    if (fullPage) await autoScroll(page);
    await page.screenshot({ path: `images/${prefix}-${i}-${d.split('://')[1].replace(/[./]/g, "-") }-${width}-${height}.png`, fullPage: fullPage });
    await page.close();
    progress.addTick();
    log(progress.getTick() / progress.getTotal())
  })().catch((errors) => {
    console.log(errors)
  })
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}