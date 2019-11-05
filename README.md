# [NERACOOS ERDDAP](http://www.neracoos.org/erddap/) Highstock Viewer

## Summary
A simple demonstration of the speed of both ERDDAP's RESTful API and HighStocks for creating time series plots.  Dataset B01_met_all is used since it has observations back to  07/09/2001 and has observations every 10 minutes, a time series with over 600K observations. Also demonstrates the use ERDDAP info / metadata queries.

## Background
Simplify and convert javascript jQuery, Drupal PHP cache creation code used at http://www.neracoos.org/lgnc/ERDHighStock/hs_erddap.html to use modern browser based pure modern javascript ES6 features. Mainly this meant removing all jQuery dependencies and confirming the HighCharts does not need jQuery.  
The main purpose is a simple demonstration of the speed of both ERDDAP and HighStocks for creating time series plots. Dataset B01_met_all is used since it has observations back to  07/09/2001 and has observations every 10 minutes, a long time series.  
It demonstrates how to get info, metadata and observations using the ERDDAP RESTFul API.
  

## Requirements 
  - ERDDAP server must have CORS enabled.  The NERACOOS ERDDAP uses Apache to enable CORS.
  - Modern browser which supports ES6.

##  Usage
  - Just load erd_parse_hs.html into your browser via File Open. No Web server required.
  - http://www.neracoos.org/lgnc/ERDFetch/erd_parse_hs.html  - Web server example.
  - [HighCharts]( https://www.highcharts.com )
  - [Coastwatch West Coast ERDDAP]( https://coastwatch.pfeg.noaa.gov/erddap/index.html)
