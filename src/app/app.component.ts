import { Component } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  fileName = 'Infrastructure Report.xlsx';
  criteria_keys:any=[];
  finalResult:any;
  total_memory=0;
  total_cpu=0;
  total_storage=0;
  fileUpload(ev:any) {
      let workBook:any = null;
      let jsonData = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary' });
        jsonData = workBook.SheetNames.reduce((initial:any, name:any) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet);
          return initial;
        }, {});
        console.log('jsonData')
        console.log(jsonData.Sheet1)
        let data_result= this.groupBy(jsonData.Sheet1,'Product/Application Name')
        console.log('data_result')
        console.log(data_result)
        this.mergeForSameName(data_result)
      }
      reader.readAsBinaryString(file);
  }


  groupBy(arr:any, criteria:any) {
    const newObj = arr.reduce((acc:any, currentValue:any) => {
      if (!acc[currentValue[criteria]]) {
        acc[currentValue[criteria]] = [];
      }
      if(!this.criteria_keys.includes(currentValue[criteria])){
        // To get the all criteria_keys that being in my sheet 
        this.criteria_keys.push(currentValue[criteria])
      }
      acc[currentValue[criteria]].push(currentValue);
      
      return acc;
    },{});
    return newObj;
  }

  mergeForSameName(arr:any){
    let all_result:any = [];
    for (let index = 0; index < this.criteria_keys.length; index++) {
    let result:any;
    arr[this.criteria_keys[index]].reduce((acc:any, currentvalue:any)=> {
      if (!acc[currentvalue['Product/Application Name']]) {
        acc[currentvalue['Product/Application Name']] = { product: currentvalue['Product/Application Name'], Processor_Count: 0,Memory_Configured:0,Storage_Configured:0 };
        // every object will store here 
        result=acc[currentvalue['Product/Application Name']];
      }
      // convert string to number by split GB 
      let memory_value=(currentvalue['Memory Configured']).split(" ");
      let storage_value=(currentvalue['Storage Configured']).split(" ")
      if(storage_value[1]=='TB'){storage_value[0]=storage_value[0]*1000}
      if(storage_value[1]=='MB'){storage_value[0]=storage_value[0]/1000}
      acc[currentvalue['Product/Application Name']].Processor_Count += currentvalue['Processor Count'];
      acc[currentvalue['Product/Application Name']].Memory_Configured += Number(memory_value[0]);
      acc[currentvalue['Product/Application Name']].Storage_Configured +=  Number(storage_value[0]);
      return acc;
    }, {});
    all_result.push(result)
  }
  this.finalResult=all_result
  console.log(all_result)
  this.getMaxValues(all_result)
  }

  getMaxValues(arr:any){
    arr.forEach((element:any) => {
      this.total_memory+=element.Memory_Configured;
      this.total_cpu+=element.Processor_Count;
      this.total_storage+=element.Storage_Configured;
    });
  }


  exportXcel(){
    
      let first_element = document.getElementById('first-table');
      let second_element = document.getElementById('second-table');
          
      let worksheet_tmp1 = XLSX.utils.table_to_sheet(second_element);
      let worksheet_tmp2 = XLSX.utils.table_to_sheet(first_element);
          
      let a = XLSX.utils.sheet_to_json(worksheet_tmp1, { header: 1 })
      let b = XLSX.utils.sheet_to_json(worksheet_tmp2, { header: 1 })
          
      a = a.concat(['']).concat(b)
        
      let worksheet = XLSX.utils.json_to_sheet(a, { skipHeader: true })
      
      const new_workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(new_workbook, worksheet, "worksheet")
      XLSX.writeFile(new_workbook,this.fileName)



  }
}
