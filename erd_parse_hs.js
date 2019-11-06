    'use strict';
    // All charts using basically the same options.
    Highcharts.setOptions({
      chart: {
        defaultSeriesType: 'line',
        borderWidth: 1,
        type: 'spline',
        zoomType: 'x'
      },
      credits: {
        text: "Source: NERACOOS ERDDAP",
        href: "http://www.neracoos.org/erddap/",
        position: {
          align: 'center'
        },
        style: {
          color: "#1791DE"
        }
      },
      xAxis: {
        type: 'datetime'
      },
      plotOptions: {
        series: {
          gapSize: 6,
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true
              }
            }
          }
        }
      }
    });
    // Globals
    var nc_erd = 'http://www.neracoos.org/erddap/';
    var datasetID = 'B01_met_all';
    var data_type = 'air_temperature';
    var fetch_stime = -1.0;
    var fetch_etime = -1.0;
    // This page should work for any UMaine Met Sensors in datasetID's which all have air_temperature. 
    // Using air_temperature because in recent years it has obs every 10 minutes.
    //var datasetID = 'C02_met_all';
    //var datasetID = 'A01_met_all';
    //var datasetID = 'F01_met_all';
    // etc.
    // data_type
    //var data_type = 'barometric_pressure';

    document.getElementById('info_id').addEventListener('click', fetchERDInfo);
    document.getElementById('hs_id').addEventListener('click', fetchERDHighStocks);
    document.getElementById("dataset_id").innerHTML = "DatasetID: <i>"+ datasetID +"</i>";
    var hs_el = document.getElementById('hs_id');
    hs_el.style.display = 'none';

    //////////////////////////////////////////////////////////////////
    function getSelTime(){
      var e = document.getElementById("time_select_id");
      var erd_time = e.options[e.selectedIndex].value;
      if(!erd_time){
        erd_time = 'time>=max(time)-7days';
      }
      return(erd_time);
    }
    //////////////////////////////////////////////////////////////////
    // this is for index.json short output
    function parseInfoShort(json){
      var rows = json.table.rows;
      let output = '';
      let min_time = '';
      let max_time = '';
      // What the info response rows look like
      // ["Row Type", "Variable Name", "Attribute Name", "Data Type", "Value"],
      // and some examples for what we're interested in.
      // ["variable", "air_temperature", "", "float", ""],
      // ["attribute", "NC_GLOBAL", "time_coverage_end", "String", "2019-10-04T13:00:00Z"],
      for(var i = 0; i < rows.length; i++){
        var this_row  = rows[i];
        // save these for download request
        if(this_row[1] == 'NC_GLOBAL' && this_row[2] == 'time_coverage_start'){
          output += '<li>' + this_row[2] + ': ' + this_row[4] + '</li>';
          min_time = this_row[4];
        }
        if(this_row[1] == 'NC_GLOBAL' && this_row[2] == 'time_coverage_end'){
          output += '<li>' + this_row[2] + ': ' + this_row[4] + '</li>';
          max_time = this_row[4];
        }
      }
      output += "<br />Full Time Range: " + min_time + " End: " + max_time;
      document.getElementById('hs_id').style.display = 'block';
      return(output);
    }
    //////////////////////////////////////////////////////////////////

    // this is for index.json
    function parseInfo(json){
      var rows = json.table.rows;
      let output = '';
      let min_time = '';
      let max_time = '';
      // What the info response rows look like
      // ["Row Type", "Variable Name", "Attribute Name", "Data Type", "Value"],
      // and some examples for what we're interested in.
      // ["variable", "air_temperature", "", "float", ""],
      // ["attribute", "NC_GLOBAL", "time_coverage_end", "String", "2019-10-04T13:00:00Z"],
      for(var i = 0; i < rows.length; i++){
        var this_row  = rows[i];
        if(this_row[0] == 'variable'){
          output += '<li>' + this_row[0] + ': ' + this_row[1] + ' ' + this_row[3] + '</li>';
        }
        // save these for download request
        if(this_row[1] == 'NC_GLOBAL' && this_row[2] == 'time_coverage_start'){
          output += '<li>' + this_row[2] + ': ' + this_row[4] + '</li>';
          min_time = this_row[4];
        }
        if(this_row[1] == 'NC_GLOBAL' && this_row[2] == 'time_coverage_end'){
          output += '<li>' + this_row[2] + ': ' + this_row[4] + '</li>';
          max_time = this_row[4];
        }
      }
      output += "<br />Full Time Range: " + min_time + " End: " + max_time;
      document.getElementById('hs_id').style.display = 'block';
      return(output);
    }
    //////////////////////////////////////////////////////////////////
    function createChart(time_obs_data, platform, chart_title){
      var chart1 = new Highcharts.StockChart({
        title: {
          text: chart_title
        },
        chart: {
          renderTo: document.getElementById('container1')
        },
        series: [{
          name: platform,
          data: time_obs_data,
	  	    tooltip: {
	          valueDecimals: 4
	  	    }
        }]
      });
    }
    //////////////////////////////////////////////////////////////////
    function parseErdForHS(json){

      // "columnUnits": [null, "UTC", null, "m", "celsius", "1"],
      // "columnNames": ["station", "time", "mooring_site_desc", "depth", "air_temperature", "air_temperature_qc"],
      // "rows": [
      // ["B01", "2019-10-07T14:00:00Z", "Western Maine Shelf", -3.0, 15.59, 0],

      var colNames = json.table.columnNames;
      var colUnits = json.table.columnUnits;
      var rows = json.table.rows;

      var data_type = colNames[4];
      var data_type_units = colUnits[4];
      var meta_data = rows[0];
      var platform = meta_data[0];
      var site_desc = meta_data[2];
      var depth = meta_data[3];
      var stime = meta_data[1];
      var etime = rows[rows.length - 1][1];
      var chart_title = platform + ' ' + data_type + ' at ' + depth + ' (m) ';
      var time_obs_data = [];
      for(var i = 0; i < rows.length; i++){
        var this_row  = rows[i];
        var msse = Date.parse(this_row[1]);
        time_obs_data.push( [ msse, this_row[4] ] );
      }

      var last_row = rows[rows.length - 1];
      let output = '';
      output += "Station: " + platform + " - " + site_desc + "<br />";
      output += "Obs. Count: " + rows.length;
      output += "<br />Time Range: " + stime + " thru " + etime;
      // HERE hide and show container1
      document.getElementById('container1').style.display = 'none';
      createChart(time_obs_data, platform, chart_title);
      document.getElementById('container1').style.display = 'block';
      return(output);
    }
    //////////////////////////////////////////////////////////////////
    // fetch routines.
    //////////////////////////////////////////////////////////////////
    function fetchERDInfo(){
      let nc_erd_info_url = nc_erd + 'info/' + datasetID + '/index.json';
      document.getElementById("erd_query").innerHTML = nc_erd_info_url;
      fetch(nc_erd_info_url)
        .then(response => response.json())
        .then(function(json){
            let output = parseInfoShort(json);
            document.getElementById("info_response").innerHTML = output;
          });
    }
    // 
    //////////////////////////////////////////////////////////////////
    function fetchERDHighStocks(){
      let erd_vars = 'station,time,mooring_site_desc,depth,';
      let cur_dt = data_type;
      // qc flag constraint. B01 met uses qc=0 for good observations.
      let erd_qc =  cur_dt + '_qc=0';
      let erd_time = getSelTime();
      let nc_erd_hs_url = nc_erd + 'tabledap/' + datasetID + '.json?' + erd_vars + cur_dt + ',' + cur_dt + '_qc';
      // add qc constaint 
      nc_erd_hs_url +=  '&' + erd_qc;
      // add time constraints
      nc_erd_hs_url +=  '&' + erd_time;
      document.getElementById("erd_query").innerHTML = nc_erd_hs_url;
      //console.log(nc_erd_hs_url);
      document.getElementById("erd_response_time").innerHTML = "";
      fetch_stime = new Date().getTime();
      fetch(nc_erd_hs_url)
        .then(response => response.json())
        .then(function(json){
          fetch_etime = new Date().getTime();
          let fetch_time =  (fetch_etime - fetch_stime) / 1000.0;
          document.getElementById("erd_response_time").innerHTML = "ERD Response Time: " + fetch_time + " seconds.";
          let output = parseErdForHS(json);
          document.getElementById("hs_response").innerHTML = output;
          });
    }

