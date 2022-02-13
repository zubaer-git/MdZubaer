/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 45.0, "KoPercent": 55.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Bangla-books"], "isController": false}, {"data": [0.0, 500, 1500, "Children-books"], "isController": false}, {"data": [0.0, 500, 1500, "Home"], "isController": false}, {"data": [0.0, 500, 1500, "Essential-book"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 40, 22, 55.0, 11250.3, 4135, 18233, 10999.0, 17126.2, 17962.8, 18233.0, 0.8316008316008316, 793.9847201468295, 0.11998928014553015], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Bangla-books", 10, 4, 40.0, 10008.9, 4135, 17177, 9501.5, 17040.100000000002, 17177.0, 17177.0, 0.5031446540880503, 527.8170695754717, 0.0756682389937107], "isController": false}, {"data": ["Children-books", 10, 4, 40.0, 10017.0, 6714, 16041, 8145.0, 15889.300000000001, 16041.0, 16041.0, 0.4179903026249791, 436.08246589460373, 0.06367821016552416], "isController": false}, {"data": ["Home", 10, 10, 100.0, 15849.4, 13167, 18233, 15833.0, 18208.3, 18233.0, 18233.0, 0.5459707359685521, 372.4782443457906, 0.06611364380869186], "isController": false}, {"data": ["Essential-book", 10, 4, 40.0, 9125.9, 6206, 12305, 9407.0, 12176.1, 12305.0, 12305.0, 0.6567713122290818, 686.0076411237357, 0.10069638283199789], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The result was the wrong size: It was 698,624 bytes, but should have been greater or equal to 1,000,000 bytes.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The result was the wrong size: It was 698,620 bytes, but should have been greater or equal to 1,000,000 bytes.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 12,560 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 12,354 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The result was the wrong size: It was 698,618 bytes, but should have been greater or equal to 1,000,000 bytes.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 14,729 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 11,480 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The result was the wrong size: It was 698,589 bytes, but should have been greater or equal to 1,000,000 bytes.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 14,524 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 15,808 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 10,081 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The result was the wrong size: It was 698,595 bytes, but should have been greater or equal to 1,000,000 bytes.", 2, 9.090909090909092, 5.0], "isController": false}, {"data": ["The operation lasted too long: It took 16,041 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The result was the wrong size: It was 698,603 bytes, but should have been greater or equal to 1,000,000 bytes.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The result was the wrong size: It was 698,601 bytes, but should have been greater or equal to 1,000,000 bytes.", 3, 13.636363636363637, 7.5], "isController": false}, {"data": ["The operation lasted too long: It took 10,982 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 11,016 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 12,305 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}, {"data": ["The operation lasted too long: It took 17,177 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, 4.545454545454546, 2.5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 40, 22, "The result was the wrong size: It was 698,601 bytes, but should have been greater or equal to 1,000,000 bytes.", 3, "The result was the wrong size: It was 698,595 bytes, but should have been greater or equal to 1,000,000 bytes.", 2, "The result was the wrong size: It was 698,624 bytes, but should have been greater or equal to 1,000,000 bytes.", 1, "The result was the wrong size: It was 698,620 bytes, but should have been greater or equal to 1,000,000 bytes.", 1, "The operation lasted too long: It took 12,560 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Bangla-books", 10, 4, "The operation lasted too long: It took 12,560 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, "The operation lasted too long: It took 14,729 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, "The operation lasted too long: It took 17,177 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, "The operation lasted too long: It took 15,808 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, null, null], "isController": false}, {"data": ["Children-books", 10, 4, "The operation lasted too long: It took 12,354 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, "The operation lasted too long: It took 11,480 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, "The operation lasted too long: It took 14,524 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, "The operation lasted too long: It took 16,041 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, null, null], "isController": false}, {"data": ["Home", 10, 10, "The result was the wrong size: It was 698,601 bytes, but should have been greater or equal to 1,000,000 bytes.", 3, "The result was the wrong size: It was 698,595 bytes, but should have been greater or equal to 1,000,000 bytes.", 2, "The result was the wrong size: It was 698,603 bytes, but should have been greater or equal to 1,000,000 bytes.", 1, "The result was the wrong size: It was 698,624 bytes, but should have been greater or equal to 1,000,000 bytes.", 1, "The result was the wrong size: It was 698,620 bytes, but should have been greater or equal to 1,000,000 bytes.", 1], "isController": false}, {"data": ["Essential-book", 10, 4, "The operation lasted too long: It took 10,982 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, "The operation lasted too long: It took 11,016 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, "The operation lasted too long: It took 12,305 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, "The operation lasted too long: It took 10,081 milliseconds, but should not have lasted longer than 10,000 milliseconds.", 1, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
