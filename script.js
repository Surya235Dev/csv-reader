google.charts.load('current', {'packages':['table']});

document.getElementById('clearBtn').addEventListener('click',()=>{
    document.getElementById('num1').value = '';
    document.getElementById('num2').value = '';
    document.getElementById('dataFilter').value = '';
    $('#multiple-select').val(null).trigger('change');
})

let csvTojson = (csvData) => {
    dataString = csvData
    dataString = dataString.replace(/["]+/g, '');
    var arr = splitData(dataString,'\n')
   
    if(arr[arr.length-1] == '' || arr[arr.length-1]==null || arr[arr.length-1] ==''){
        arr.pop()
    }
    var csvTojsonObj = [];
    var headers = splitData(arr[0],',')
    for (var i = 1; i < arr.length; i++) {
       
        var data = splitData(arr[i],',')
        let count = 0
        for(let item of data){
            if(item == null || item == ''){
                data[count] = 'NULL'
            }
            count += 1
        }
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


let saveAsXLS = (data) => {
    var download = document.getElementById('download-xls-format');
    download.setAttribute('href', 'data:text/xls;charset=utf-8,' + encodeURIComponent(data));
    download.setAttribute('download', 'new_csv_file.xls');
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

document.getElementById('receive-csv-file').addEventListener('change',function(){
    //  $('#multiple-select').val(null).trigger('change');
    document.getElementById('surya').textContent = ''
    document.getElementById('num1').value = '';
    document.getElementById('num2').value = '';
    
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
                'headerRow': 'text-light bg-secondary headerRow',
                'tableRow': 'tableRow',
                'oddTableRow': 'beige-background tableRow',
                'selectedTableRow': 'orange-background large-font',
                'hoverTableRow': 'hoverTableRow',
                'headerCell': 'gold-border',
                'tableCell': 'datas',
                'rowNumberCell': 'underline-blue-font'};
             
           
            var data = google.visualization.arrayToDataTable(newArr);
        
            var table = new google.visualization.Table(document.getElementById('table_div'));
        
            table.draw(data, {showRowNumber: true, width: '100%', height: '100%', pageSize: '15','allowHtml': true, 'cssClassNames': cssClassNames, pagingSymbols: {
                prev: '<button class="btn prev page-count">Prev</button>',
                next: '<button class="btn next page-count">Next</button>'
            }});
           
        }
       
        document.getElementById('tableDisplay').style.display='block'
        document.getElementById("num2").placeholder = `End Row Number. Default : ${jsonData.length}`;
       
        // data = ['name','age','marks','college']
        document.getElementById('multiple-select').innerHTML = ''
        let selectionData = document.getElementById('multiple-select')
        let count = 0
for(let item of columnsSelector){
let createOption = document.createElement('option');
createOption.setAttribute('value',`${item}`)
createOption.textContent = item
selectionData.append(createOption)
count += 1
}
        
        manipluate(jsonData)
      }
    
    fr.readAsText(this.files[0]);
});



let manipluate = (csvData) => {
    let newColumnSelector = []
    let newTable = document.getElementById('generateNewTable')
    newTable.addEventListener('click', () => {
        document.getElementById('surya').textContent = ''
        let filterData = document.getElementById('dataFilter').value;
        let startNum = document.getElementById('num1').value;
        let endNum = document.getElementById('num2').value;





        let inputSelectorData = $("#multiple-select").select2('data')
        let newColumnsNames = Object.values(inputSelectorData)
        newColumnSelector = []
        for(let item of newColumnsNames){
            newColumnSelector.push(item['text'])
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
    
        let filterDataArray = filterData.split(',')
            filterDataArray = filterDataArray.map(items=>{
                return items.replace(/\s/g,'') 
            })

        let newArrayData;
        if(filterData == ''){
            newArrayData = newDataArray
        } else {
            
            
            let [columnsNames,...remaining] = newDataArray
            let newDataSet = new Set()
            for(let items in filterDataArray){
                for(let item of remaining){
                    if(item.includes(filterDataArray[items])){
                        newDataSet.add(item)
                    }
                }
            }
            newArrayData = Array.from(newDataSet)
            newArrayData.unshift(columnsNames)
        }

        if(newArrayData.length>1){
            document.getElementById('dataFilter').value = ''
            google.charts.setOnLoadCallback(drawNewTable);
            document.getElementById('dataFilter').classList.remove('is-invalid')
        } else{
            $('#multiple-select').val(null).trigger('change');
            document.getElementById('dataFilter').classList.add('is-invalid')
            document.getElementById('dataFilter').value = ''
            document.getElementById('dataFilter').placeholder = 'Invalid Search key or Select required "column Name", and type data value. ';
        }

      
        function drawNewTable() {
            var cssClassNames = {
                'headerRow': 'text-light bg-secondary headerRow',
                'tableRow': 'tableRow',
                'oddTableRow': 'beige-background tableRow',
                'selectedTableRow': 'orange-background large-font',
                'hoverTableRow': 'hoverTableRow',
                'headerCell': 'gold-border',
                'tableCell': 'datas',
                'rowNumberCell': 'underline-blue-font'};
            var data = google.visualization.arrayToDataTable(newArrayData);
        
            var table = new google.visualization.Table(document.getElementById('table_div_new'));
        
            table.draw(data, {showRowNumber: true, width: '100%', height: '100%', pageSize: '15','allowHtml': true, 'cssClassNames': cssClassNames, pagingSymbols: {
                prev: '<button class="btn prev">Prev</button>',
                next: '<button class="btn next pagi">Next</button>'
            }});
           
        }
      
        document.getElementById('tableDisplay1').style.display='block';
        let toCSVfile = arrayToCSV(newArrayData)
        console.log(newArrayData)
        saveAsCSV(toCSVfile)
        saveAsXLS(toCSVfile)
          
        document.getElementById('pdfDownload').addEventListener('click',function(){
            
            saveAsPDF(newArrayData)
        });
    });

   
}

let saveAsPDF = (newArrayData) => {
    
    let [header,...contents] = newArrayData
    filedObj = {}
newArrs = []
for(let item of header){
filedObj = {}
filedObj['field'] = item
filedObj['title'] = item
newArrs.push(filedObj)
}

let suryaTable = document.getElementById('surya');
let createThead = document.createElement('thead')
let createTr = document.createElement('tr')
for(let a of header){
let createTh = document.createElement('th')
createTh.textContent = a
createTr.append(createTh)

}
createThead.append(createTr)
suryaTable.append(createThead)
let createTbody = document.createElement('tbody')
count = 0;
for(let b of contents){
createTr1 = document.createElement('tr')
for(let a in header){
    createTd = document.createElement('td')
    createTd.textContent = b[a]
    createTr1.append(createTd)
}
createTbody.append(createTr1)
}
suryaTable.append(createTbody)   
        var dataSource = shield.DataSource.create({
            data: "#surya",
            schema: {
                type: "table"
            }
        });

    
        dataSource.read().then(function (data) {
            var pdf = new shield.exp.PDFDocument({
                author: "Surya",
                created: new Date()
            });

            pdf.addPage("a4", "landscape");
            pdf.table(
                50,
                50,
                data,
                newArrs,
                {
                    margins: {
                        top: 10,
                        left:10
                    }
                }
            );
          

            pdf.saveAs({
                fileName: "csv_to_pdf"
            });
        });

        document.getElementById('surya').textContent = ''
 
}
