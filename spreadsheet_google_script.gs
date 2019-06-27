function myFunction() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var datarange = sheet.getDataRange();
  var numRows = datarange.getNumRows();
  var serkey = 'XXXX';
  
  function addresser(sidoName){
    
    var address = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=' + serkey + '&numOfRows=100&pageSize=10&pageNo=1&startPage=1&sidoName=' + sidoName + '&ver=1.3&_returnType=json';
    return address;
    
  }
  
  function khai_grader(value){
    
    var tmp = Number(value);
    if(tmp <= 50) return "1//" + value;
    else if(tmp <= 100) return "3//" + value;
    else if(tmp <= 250) return "5//" + value;
    else if(tmp > 250) return "7//" + value;
    else return value;
    
  }
  
  function pm10_grader(value){
    
    var tmp = Number(value);
    if(tmp <= 15) return "1//" + value;
    else if(tmp <= 30) return "2//" + value;
    else if(tmp <= 40) return "3//" + value;
    else if(tmp <= 50) return "4//" + value;
    else if(tmp <= 75) return "5//" + value;
    else if(tmp <= 100) return "6//" + value;
    else if(tmp <= 150) return "7//" + value;
    else if(tmp > 150) return "8//" + value;
    else return value;
    
  }
  
  function pm25_grader(value){
    
    var tmp = Number(value);
    if(tmp <= 8) return "1//" + value;
    else if(tmp <= 15) return "2//" + value;
    else if(tmp <= 20) return "3//" + value;
    else if(tmp <= 25) return "4//" + value;
    else if(tmp <= 37) return "5//" + value;
    else if(tmp <= 50) return "6//" + value;
    else if(tmp <= 75) return "7//" + value;
    else if(tmp > 75) return "8//" + value;
    else return value;
    
  }
  
  function so2_grader(value){
    
    var tmp = Number(value);
    if(tmp <= 0.01) return "1//" + value;
    else if(tmp <= 0.02) return "2//" + value;
    else if(tmp <= 0.04) return "3//" + value;
    else if(tmp <= 0.05) return "4//" + value;
    else if(tmp <= 0.1) return "5//" + value;
    else if(tmp <= 0.15) return "6//" + value;
    else if(tmp <= 0.6) return "7//" + value;
    else if(tmp > 0.6) return "8//" + value;
    else return value;
    
  }
  
  function co_grader(value){
    
    var tmp = Number(value);
    if(tmp <= 1) return "1//" + value;
    else if(tmp <= 2) return "2//" + value;
    else if(tmp <= 5.5) return "3//" + value;
    else if(tmp <= 9) return "4//" + value;
    else if(tmp <= 12) return "5//" + value;
    else if(tmp <= 15) return "6//" + value;
    else if(tmp <= 32) return "7//" + value;
    else if(tmp > 32) return "8//" + value;
    else return value;
    
  }
  
  function o3_grader(value){
    
    var tmp = Number(value);
    if(tmp <= 0.02) return "1//" + value;
    else if(tmp <= 0.03) return "2//" + value;
    else if(tmp <= 0.06) return "3//" + value;
    else if(tmp <= 0.09) return "4//" + value;
    else if(tmp <= 0.12) return "5//" + value;
    else if(tmp <= 0.15) return "6//" + value;
    else if(tmp <= 0.38) return "7//" + value;
    else if(tmp > 0.38) return "8//" + value;
    else return value;
    
  }
  
  function no2_grader(value){
    
    var tmp = Number(value);
    if(tmp <= 0.02) return "1//" + value;
    else if(tmp <= 0.03) return "2//" + value;
    else if(tmp <= 0.05) return "3//" + value;
    else if(tmp <= 0.06) return "4//" + value;
    else if(tmp <= 0.13) return "5//" + value;
    else if(tmp <= 0.2) return "6//" + value;
    else if(tmp <= 1.1) return "7//" + value;
    else if(tmp > 1.1) return "8//" + value;
    else return value;
    
  }
  
  function tchanger(t){
    function twodi(n){
      if(n<10) return "0" + n;
      else return n;
    }
    return "" + t.getFullYear() + twodi(t.getMonth()+1) + twodi(t.getDate()) + twodi(t.getHours());
  }
  
  function findmax(a,b,c){
    var a_spl = a.split('//');
    var b_spl = b.split('//');
    var c_spl = c.split('//');
    var this_time = Number(tchanger(new Date()));
    
    if(this_time - Number(a_spl[2]) > 70) return 0;
    if(this_time - Number(b_spl[2]) > 70) return 0;
    if(this_time - Number(c_spl[2]) > 70) return 0;
    
    a = (a_spl.length > 2 || a_spl[0] == '-') ? 0 : a_spl[0];
    b = (b_spl.length > 2 || b_spl[0] == '-') ? 0 : b_spl[0];
    c = (c_spl.length > 2 || c_spl[0] == '-') ? 0 : c_spl[0];
    if(a>=b && a>=c) return a;
    else if (b>=c) return b;
    else return c;
  }
  
  /*
  Logger.log(Object.keys(res2));
  Logger.log(res2.list.length);
  Logger.log(res2.list[6].pm25Value);
  */
  
  //var now = sheet.getRange("C6:M400").getValues();
  //var ago = sheet.getRange("O6:Y400").setValues(now);
  
  sheet.getRange(3,4).setValue(new Date());
  
  var sidoName = ['서울', '경기', '인천', '강원', '충남', '충북', '세종', '대전', '경북', '대구', '울산', '경남', '부산', '전북', '전남', '광주', '제주'];
  var rownum = 0;
  var amount = sheet.getRange(5,3).getValue();
  var data = sheet.getRange(6,1,amount,15).getValues();
  var total_res2_length = 0;
  
  
  for (var j = 0; j < sidoName.length; j++){ //sidoName.length
    
    var response = UrlFetchApp.fetch(addresser(sidoName[j]));
    var res2 = JSON.parse(response);
    
    //Logger.log(Object.keys(res2));
    //Logger.log(typeof(res2.list[0].dataTime));
    //Logger.log(typeof(res2.list[0].stationName));
    //Logger.log(res2.list[0].stationName);
    //Logger.log(typeof(res2.list[0].dataTime));
    //Logger.log(res2.parm);
    //Logger.log(res2.ArpltnInforInqireSvcVo);
    
    total_res2_length += res2.list.length;
    
    Logger.log('total_res2_length is ' + total_res2_length);
    Logger.log('amount is ' + amount);
    if(total_res2_length > amount){// total res 길이가 더 길 경우 data에 공백을 추가해 길이 늘려줌
      for (var i = 0; i < total_res2_length - amount; i++){
        var new_row = [" ", " ", sidoName[j], '공백', res2.list[i].dataTime, '1//0', '1//0', '1//0', '1//0', '1//0', '1//0', '1//0', '1//0',"", ""];
        data.splice(amount + i, 0, new_row);
        Logger.log('amount of data revised!!!!!!! ');
      }
    }
    
    for( var i = 0; i < res2.list.length; i++){ //res2.list.length
      //Logger.log('i loop');
      //Logger.log(res2.list[i].stationName);
      if(!(Object.keys(res2.list[i]).length)){ 
        rownum += 1;
        continue;
      }
      Logger.log('rownum is ' + rownum);
      Logger.log('i is ' + i);
      if(data[rownum][3].split('//')[0] !== res2.list[i].stationName){//이번 순서의 측정소와 이름 일치x시
        Logger.log('if statement');
        Logger.log(res2.list[i].stationName);
        Logger.log(data[rownum][3].split('//')[0]);
        
        if(data[rownum][3].split('//')[0] == '공백'){ // 공백 칸일 시 그냥 새 데이터로 채우기
          var new_row = [" ", " ", sidoName[j], res2.list[i].stationName, res2.list[i].dataTime, khai_grader(res2.list[i].khaiValue), pm10_grader(res2.list[i].pm10Value), pm25_grader(res2.list[i].pm25Value), so2_grader(res2.list[i].so2Value), co_grader(res2.list[i].coValue), o3_grader(res2.list[i].o3Value), no2_grader(res2.list[i].no2Value), res2.list[i].mangName,"", ""];
          data.splice(rownum, 1, new_row);
          sheet.getRange(1,6).setValue(sheet.getRange(1,6).getValue() + '//' + res2.list[i].stationName + "//" + tchanger(new Date(res2.list[i].dataTime.replace(/-/g, "/"))));
          amount += 1;
          rownum += 1;
          Logger.log('공백 채움');
          continue;
        }
        
        var c = data[rownum][3].split('//')[0];
        var addr = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName=' + c + '&dataTerm=month&pageNo=1&numOfRows=100&ServiceKey='+ serkey +'&ver=1.3&_returnType=json';
        var tmp_response = UrlFetchApp.fetch(addr);
        var tmp_res2 = JSON.parse(tmp_response);
        
        if(!tmp_res2.list.length){//이번 순서의 측정소와 이름 일치x하고 측정소정보도 없을때 (삭제된 측정소)
          //Logger.log('if 1');
          sheet.getRange(2,6).setValue(sheet.getRange(2,6).getValue() + '//' + data[rownum][3].split('//')[0] + '//' + tchanger(new Date()));
          data.splice(rownum,1);
          amount -= 1;
          i -= 1;
          continue;
        } else{ //이번 순서의 측정소와 이름 일치x하지만 측정소 정보는 있음
          Logger.log('if 2');
          var stationNames = data.map(function(value,index) { return value[3]; });
          var tmp_index = stationNames.indexOf(res2.list[i].stationName);
          var tmp_index2 = stationNames.indexOf(data[rownum][3].split('//')[0]);
          
          Logger.log('stationName is ' + res2.list[i].stationName);
          Logger.log('tmp_index is ' + tmp_index);
          Logger.log('tmp_index2 is ' + tmp_index2);
          Logger.log('rownum is ' + rownum);
          
          if(tmp_index2 < rownum){// 먼저 data 내의 중복이었다면 제거
            Logger.log('if 4');
            data.splice(rownum,1);
            amount -= 1;
            //i -= 1;
            //continue;
          }
          
          if(tmp_index == -1){ //이번 순서의 측정소와 이름 일치x하고 data안에도 없을때 (새로운 측정소)
            
            Logger.log('if 3');
            var new_row = [" ", " ", sidoName[j], res2.list[i].stationName, res2.list[i].dataTime, khai_grader(res2.list[i].khaiValue), pm10_grader(res2.list[i].pm10Value), pm25_grader(res2.list[i].pm25Value), so2_grader(res2.list[i].so2Value), co_grader(res2.list[i].coValue), o3_grader(res2.list[i].o3Value), no2_grader(res2.list[i].no2Value), res2.list[i].mangName,"", ""];
            data.splice(rownum, 0, new_row);
            sheet.getRange(1,6).setValue(sheet.getRange(1,6).getValue() + '//' + res2.list[i].stationName + "//" + tchanger(new Date(res2.list[i].dataTime.replace(/-/g, "/"))));
            amount += 1;
            rownum += 1;
            continue;            
          
          } else{ //이번 순서의 측정소와 이름 일치x하지만, data안에는 있을때 (위치 바뀜)
            Logger.log('if 5');
            var tmp_data = data[tmp_index];
            data.splice(tmp_index,1);
            data.splice(i,0,tmp_data);
            i -= 1;
            continue;
          }
        }
      }
      
      //Logger.log(res2.list[i].stationName);
      //Logger.log(Object.keys(res2.list[i]));
      //Logger.log(Object.keys(res2.list[i]).length);
      //Logger.log(res2.list[i]);
      
      var t = res2.list[i].dataTime.replace(/-/g, "/");
      var t1 = new Date(t);
      var t2 = new Date();
      var past = tchanger(data[rownum][4]);
      
      if(tchanger(t1) === tchanger(data[rownum][4]) && tchanger(t1) !== tchanger(t2)){
        
        if(data[rownum][0] === " "){
          data[rownum][1] = tchanger(t1);
          data[rownum][5] = data[rownum][5] + "//" + past;
          data[rownum][6] = data[rownum][6] + "//" + past;
          data[rownum][7] = data[rownum][7] + "//" + past;
          data[rownum][8] = data[rownum][8] + "//" + past;
          data[rownum][9] = data[rownum][9] + "//" + past;
          data[rownum][10] = data[rownum][10] + "//" + past;
          data[rownum][11] = data[rownum][11] + "//" + past;
          data[rownum][13] = data[rownum][13] + "//" + past;
          data[rownum][14] = 0;
        }
        
        data[rownum][0] = tchanger(t2) ;
        
        rownum += 1;
        continue;
      }
      
      if(t1.getTime() === data[rownum][4].getTime()){
        rownum += 1;
        continue;
      }
      
      //var now = sheet.getRange("C"+(rownum+6)+":"+"M"+(rownum+6)).getValues();
      //var ago = sheet.getRange("O"+(rownum+6)+":"+"Y"+(rownum+6)).setValues(now);
      
      
      data[rownum][0] = " ";
      data[rownum][1] = " ";
      
      data[rownum][4] = res2.list[i].dataTime;
      
      if(res2.list[i].khaiValue !== '-'){
        data[rownum][5] = khai_grader(res2.list[i].khaiValue);
      } else if(data[rownum][5].split('//').length < 3){
        data[rownum][5] = data[rownum][5] + "//" + past;
      }
      
      if(res2.list[i].pm10Value !== '-'){
        data[rownum][6] = pm10_grader(res2.list[i].pm10Value);
      } else if(data[rownum][6].split('//').length < 3){
        data[rownum][6] = data[rownum][6] + "//" + past;
      }
      
      if(res2.list[i].pm25Value !== '-'){
        data[rownum][7] = pm25_grader(res2.list[i].pm25Value);
      } else if(data[rownum][7].split('//').length < 3){
        data[rownum][7] = data[rownum][7] + "//" + past;
      }
      
      if(res2.list[i].so2Value !== '-'){
        data[rownum][8] = so2_grader(res2.list[i].so2Value);
      } else if(data[rownum][8].split('//').length < 3){
        data[rownum][8] = data[rownum][8] + "//" + past;
      }
      
      if(res2.list[i].coValue !== '-'){
        data[rownum][9] = co_grader(res2.list[i].coValue);
      } else if(data[rownum][9].split('//').length < 3){
        data[rownum][9] = data[rownum][9] + "//" + past;
      }
      
      if(res2.list[i].o3Value !== '-'){
        data[rownum][10] = o3_grader(res2.list[i].o3Value);
      } else if(data[rownum][10].split('//').length < 3){
        data[rownum][10] = data[rownum][10] + "//" + past;
      }
      
      if(res2.list[i].no2Value !== '-'){
        data[rownum][11] = no2_grader(res2.list[i].no2Value);
      } else if(data[rownum][11].split('//').length < 3){
        data[rownum][11] = data[rownum][11] + "//" + past;
      }
      
      data[rownum][12] = res2.list[i].mangName;
      
      var tmp_sts = findmax(data[rownum][5], data[rownum][6], data[rownum][7]);
      if (tmp_sts != 0) {
        if (Number(String(data[rownum][13]).split('//')[0])!==0) data[rownum][14] = Number(tmp_sts) - Number(String(data[rownum][13]).split('//')[0]);
        else data[rownum][14] = 0;
        data[rownum][13] = tmp_sts;
      } else if(String(data[rownum][13]).length < 2) {
        data[rownum][13] = data[rownum][13] + "//" + past;
        data[rownum][14] = 0;
      } else{
        data[rownum][14] = 0;
      }
      
      rownum += 1;
    
    }
    
    sheet.getRange(6,1,amount,15).setValues(data);
    
  }
  sheet.getRange(3,3).setValue(total_res2_length);
  sheet.getRange(4,3).setValue(amount);
  sheet.getRange(5,1,1,3).setValues([[tchanger(new Date()),tchanger(new Date()),rownum]]);
  
  sheet.getRange(4,4).setValue(new Date());

}
