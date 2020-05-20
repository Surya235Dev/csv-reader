google.charts.load('current', {'packages':['table']});

let csvTojson = (csvData) => {
    dataString = csvData
    dataString = dataString.replace(/["]+/g, '');
    var arr = splitData(dataString,'\n')
    var csvTojsonObj = [];
    var headers = splitData(arr[0],',')
    console.log(headers)
    for (var i = 1; i < arr.length; i++) {
        var data = splitData(arr[i],',')
        var obj = {};
        for (var j = 0; j < data.length; j++) {
            obj[headers[j].trim().toLowerCase()] = data[j].trim();
        }
       csvTojsonObj.push(obj);
    }
    return csvTojsonObj
}

let saveAsCSV = (data) => {
    var download = document.getElementById('download-csv-format');
    download.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
    download.setAttribute('download', 'new_csv_file.csv');
}

let arrayTo2d = (arrData, columns) => {
    let newArr = []
    newArr.push(columns);
    while(arrData.length){
        newArr.push(arrData.splice(0, columns.length))
    }
    return newArr
}

let filterColData = (data, start, end) =>{ return data.slice(start, end)}

let arrayToCSV = (info)=>{
    let finalValue = '';
    
    for (var i = 0; i < info.length; i++) {
        var value = info[i];

        for (var j = 0; j < value.length; j++) {
            var innerValue = value[j] === null ? '' : value[j].toString();
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalValue += ',';
            finalValue += result;
        }

        finalValue += '\n';
    }
    return finalValue
}

let splitData = (data,expression) => {return data.split(expression)}

let datacsvtoArray = (a,b) => {
    dataArr = []
    for (let row of a) {
        for (let col of b) {
            dataArr.push(row[col])
        }
    }
    return dataArr
}
document.getElementById('receive-file').addEventListener('change',function(){

    var fr = new FileReader();
    fr.onload = function() {
        csvData = fr.result;
        let jsonData =csvTojson(csvData)
    
        columnsName = Object.keys(jsonData[0])
        start = 0
        end = jsonData.length
        filterRows = filterColData(jsonData, start, end)
        let columnsSelector = ''
        for (let items of columnsName) {
            columnsSelector += ',' + items
        }
    
    
        columnsSelector = columnsSelector.replace(/^.{1}/g, '');
        columnsSelector = splitData(columnsSelector,',')

        let arr = datacsvtoArray(filterRows, columnsSelector)

        let newArr = arrayTo2d(arr, columnsSelector)
    
        google.charts.setOnLoadCallback(drawTable);
    
        function drawTable() {
            var cssClassNames = {
                'headerRow': 'italic-darkblue-font large-font bold-font header',
                'tableRow': '',
                'oddTableRow': 'beige-background',
                'selectedTableRow': 'orange-background large-font',
                'hoverTableRow': '',
                'headerCell': 'gold-border',
                'tableCell': 'datas',
                'rowNumberCell': 'underline-blue-font'};
            var data = google.visualization.arrayToDataTable(newArr);
          
            var table = new google.visualization.Table(document.getElementById('table_div'));
            
            table.draw(data, {
                showRowNumber: true,
                page:'enable',
                width: '100%',
                height: '100%',
                pageSize: '15',
                'allowHtml': true, 
                'cssClassNames': cssClassNames,
                pagingSymbols: {
                    prev: '<button class="btn btn-success">Prev</button>',
                    next: '<button class="btn btn-success">Next</button>'
                },
            
                
            });
            document.getElementById('table_div').style.display='block';
            document.getElementById('csv-manipulation').style.display='block'
            
           
          }
        document.getElementById("num2").placeholder = `End Row Number. Default : ${jsonData.length}`;
       
        
        
          let newInput = document.getElementById('selection-option')
              let count = 0
              for(let item of columnsSelector){
                  let createOption = document.createElement('option')
                  createOption.textContent = item
                  createOption.setAttribute('value',`${count}`)
                  newInput.append(createOption)
                  count += 1
              }
              $('#selection-option').multiSelect();
       manipluate(jsonData)
      }
    
    fr.readAsText(this.files[0]);
})

let manipluate = (csvData) => {
    let flag = false
    let submitBtn = document.getElementById('submitBtn')
    submitBtn.addEventListener('click', () => {
        let startNum = document.getElementById('num1').value;
        let endNum = document.getElementById('num2').value;
    
        let newColumnSelector = []
        let selectionItem = document.getElementById('selection-option');
        for(let item of selectionItem){
            if(item.hasAttribute('selected')){
                    newColumnSelector.push(item.textContent)
            }
        }

        if (startNum == '' && endNum == '') {
            startNum = 0
            endNum = csvData.length
        } else if (startNum == '') {
            startNum = 0
        } else if (endNum == '') {
            endNum = csvData.length
        } else if(endNum == '0'){
            endNum = 1
        }

        if(newColumnSelector.length===0){
            newColumnSelector = Object.keys(csvData[0])
        }
    
        newfilterRows = filterColData(csvData, startNum, endNum)
    
        let newArray = datacsvtoArray(newfilterRows,newColumnSelector)
    
        let newDataArray = arrayTo2d(newArray,newColumnSelector )
    
       google.charts.setOnLoadCallback(drawNewTable);
    
        function drawNewTable() {
            var cssClassNames = {
                'headerRow': 'italic-darkblue-font large-font bold-font header',
                'tableRow': '',
                'oddTableRow': 'beige-background',
                'selectedTableRow': 'orange-background large-font',
                'hoverTableRow': '',
                'headerCell': 'gold-border',
                'tableCell': 'datas',
                'rowNumberCell': 'underline-blue-font'};
            var data = google.visualization.arrayToDataTable(newDataArray);
            var table = new google.visualization.Table(document.getElementById('new_table_div'));
            
            table.draw(data, {
                showRowNumber: true,
                page:'enable',
                width: '100%',
                height: '100%',
                pageSize: '15',
                'allowHtml': true, 
                'cssClassNames': cssClassNames,
                pagingSymbols: {
                    prev: '<button class="btn btn-success">Prev</button>',
                    next: '<button class="btn btn-success">Next</button>'
                }
            
                
            })
        
    
        }
        document.getElementById('new_table_div').style.display='block';
        let toCSVfile = arrayToCSV(newDataArray)
        saveAsCSV(toCSVfile)
       
    });
}
