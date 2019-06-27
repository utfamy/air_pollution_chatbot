'use strict';
const PAGE_ACCESS_TOKEN = "XXXX";
// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

const fs = require('fs'); //Google API hoisted
const SHEET_ID_1 = 'XXXX'; //Google API hoisted
const SHEET_ID_2 = 'XXXX'; //Google API hoisted
const SHEET_ID_3 = 'XXXX'; //Google API hoisted

const querystring = require("querystring"); //urlencode for Kakao API

let okok = {"message": "default"};

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  
	// Parse the request body from the POST
	let body = req.body;

	// Check the webhook event is from a Page subscription
	if (body.object === 'page') {

		body.entry.forEach(function(entry) {

			// Gets the body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log("This is webhook event!! ");
			console.log(webhook_event);

			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log('Sender ID: ' + sender_psid);

			// Check if the event is a message or postback and
			// pass the event to the appropriate handler function
			/*
			if (webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message);
			} else if (webhook_event.postback) {
				handlePostback(sender_psid, webhook_event.postback);
			}*/

			if (webhook_event.postback) {
				console.log('webhook_event.postback: ');
				console.log(webhook_event.postback);
				handlePostback(sender_psid, webhook_event.postback);

			} else if (webhook_event.message && !webhook_event.message.is_echo) {
				if(webhook_event.message.quick_reply){
					console.log('webhook_event.message.quick_reply.payload: ');
					console.log(webhook_event.message.quick_reply.payload);
					handlePostback(sender_psid, webhook_event.message.quick_reply);
				} else {
					console.log('webhook_event.message: ');
					console.log(webhook_event.message);
					handleMessage(sender_psid, webhook_event.message);
				}
			}
		});

		// Return a '200 OK' response to all events
		res.status(200).send('EVENT_RECEIVED');

	} else {
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

	/** UPDATE YOUR VERIFY TOKEN **/
	const VERIFY_TOKEN = "hello";

	// Parse params from the webhook verification request
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];

	// Check if a token and mode were sent
	if (mode && token) {
		//Check the mode and token sent are correct

		if (mode === 'subscribe' && token === VERIFY_TOKEN) {

			//Respond with 200 OK and challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);

		} else {
			
			//Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
});

function handleMessage(sender_psid, received_message) {
	let response;

	// Checks if the message contains text
	if (received_message.text) {

		//Create the payload for a basic text message, which
		// will be added to the body of our request to the Send API
		if(received_message.text.includes('http')){
			let attachment_url = received_message.text;
			
			console.log('this is url');
	    	console.log(attachment_url);

	    	function f(data){
	    		console.log(data);
	    		if(data.code && data.code == -2){
	    			return {"text": "이미지를 다운받을 수 없어서 뭔지 모르겠어요ㅠㅜ"}
	    		}else{
	    			if(data.result.label_kr.length == 0) return {"text": "음.. 뭔지 잘 모르겠네요ㅠㅜ"}
	    			return {"text": data.result.label_kr + "이 보이네요!"}
	    		}
	    		
	    	}
	    	callVisionKakaoAPI(sender_psid, attachment_url, f);

		} else if( ["11", "12", "21", "22", "13", "23", "14", "24"].includes(received_message.text) ) {



			let range = 'A1:D2';

			function f(rows){

				let cogn = received_message.text;

				console.log('오늘의 날씨는');
		        console.log(`${rows[0][0]}입니다.`);
		        console.log('오늘의 기온은');
		        console.log(`${rows[1][0]}입니다.`);
		        console.log(rows[Number(cogn[0])-1][Number(cogn[1])-1].toString());
		        console.log(okok.message);
		        okok.message = rows[Number(cogn[0])-1][Number(cogn[1])-1].toString();
		        console.log(okok.message);

		        let haha = rows[Number(cogn[0])-1][Number(cogn[1])-1].toString();
		        return {
		          "text": "Good!! " + haha + " " + (new Date()).toString() + " from down here"
		        };
		    }

		    sp_read(sender_psid, SHEET_ID_1, range, f);
		    sp_read(sender_psid, SHEET_ID_2, range, f);


		} else if(["33", "44"].includes(received_message.text)){
			let xCog = 127.1086228;
			let yCog = 37.4012191;

			function f(data){

				let depth1 = data.documents[0].region_1depth_name;
	    		let depth2 = data.documents[0].region_2depth_name;
	    		let depth3 = data.documents[0].region_3depth_name;
	    		return {
	    			"attachment":{
	    				"type":"template",
	    				"payload":{
	    					"template_type":"button",
	    					"text": "선택한 위치가 "  + depth1 +  " " + depth2 + " " + depth3 + " 맞나요?",
	    					"buttons":[
	    					{
	    						"type":"postback",
	    						"title":"네! 맞아요!",
	    						"payload":"LOC//1//" + depth1 + "//1//" + depth2 + "//1//" + depth3
	    					},
	    					{
	    						"type":"postback",
	    						"title":"다시 찾아볼래요",
	    						"payload":"PICK_ADD"
	    					}
	    					]
	    				}
	    			}
	    		}
	    	}

	    	callCoordinatesKakaoAPI(sender_psid, xCog, yCog, f);

	    } else{

	    	if(!received_message.is_echo) addressKakaoAPI(sender_psid, received_message.text, 1);
	    	console.log("something is wrong");

	    }

	} else if (received_message.attachments) {

		if(received_message.attachments[0].type == "location"){

			console.log("Here it is beginning!");

			let xCog = received_message.attachments[0].payload.coordinates.long;
	    	let yCog = received_message.attachments[0].payload.coordinates.lat;

	    	function f(data){
	    		if(data.code || data.documents[0].region_1depth_name == ""){
	    			let here = data.documents ? data.documents[0].address_name : "이곳" ;
	    			return {
	    				"attachment":{
		    				"type":"template",
		    				"payload":{
		    					"template_type":"button",
		    					"text": "이 서비스는 " + here + "의 대기정보는 지원하지 않습니다ㅠㅜ",
		    					"buttons":[
		    					{
		    						"type":"postback",
		    						"title":"그렇군요, 다시 찾아볼게요",
		    						"payload":"PICK_ADD"
		    					}
		    					]
		    				}
		    			}
		    		}
		    	}


	    		let depth1 = data.documents[0].region_1depth_name;
	    		let depth2 = data.documents[0].region_2depth_name;
	    		let depth3 = data.documents[0].region_3depth_name;
	    		let address_name = data.documents[0].address_name;

	    		if(depth1 == "세종특별자치시") depth2 = "세종시";

	    		return {
	    			"attachment":{
	    				"type":"template",
	    				"payload":{
	    					"template_type":"button",
	    					"text": "선택한 위치가 "  + address_name + " 맞나요?",
	    					"buttons":[
	    					{
	    						"type":"postback",
	    						"title":"네! 맞아요!",
	    						"payload":"LOC//1//" + depth1 + "//1//" + depth2 + "//1//" + depth3
	    					},
	    					{
	    						"type":"postback",
	    						"title":"다시 찾아볼래요",
	    						"payload":"PICK_ADD"
	    					}
	    					]
	    				}
	    			}
	    		}
	    	}

	    	callCoordinatesKakaoAPI(sender_psid, xCog, yCog, f);

	    } else{
	    	//Get the URL of the message attachment
	    	let attachment_url = received_message.attachments[0].payload.url;

	    	
		    response = {
		    	"attachment": {
		    		"type": "template",
		    		"payload": {
		    			"template_type": "generic",
		    			"elements": [{
		    				"title": "짠",
		    				
		    				"image_url": attachment_url,
		    				
		    			}]
		    		}
		    	}
		    }
		    callSendAPI(sender_psid, response);
		    callSendAPI(sender_psid, {'text': '헤헤'});
		}

	}
}

function handlePostback(sender_psid, received_postback) {
	console.log('ok');
	let response;
	// Get the payload for the postback
	let payload = received_postback.payload;
	// Set the response based on the postback payload
	if (payload === 'yes') {
		response = { "text": "Thanks!" }
		callSendAPI(sender_psid, response);
	} else if (payload === 'no') {
		response = { "text": "Oops, try sending another image." }
		callSendAPI(sender_psid, response);
	} else if (payload === 'hmm') {
		response = { "text": `Please send me it again.` };
		let values = [[t_tran(new Date()), sender_psid]];
		sp_write(sender_psid, SHEET_ID_1, 'L30:L', values);
		sp_write(sender_psid, SHEET_ID_2, 'P200:P', values);
		callSendAPI(sender_psid, response);
	} else if (payload === 'thanks'){
		response = { "text": "헤헤" }
		callSendAPI(sender_psid, response);
	} else if (payload === 'thanks2'){
		response = { "text": "헤헤헤" }
		callSendAPI(sender_psid, response);
	}

	if (payload === 'PICK_ADD'){
		response = {
			"text": "지역을 선택해 주세요!",
			"quick_replies":[
			{
				"content_type":"location"
			},
			{
				"content_type":"text",
				"title":"검색으로 찾기",
				"payload":"SEARCH//message//message"
			},
			{
				"content_type":"text",
				"title":"목록에서 찾기",
				"payload":"LOC//1"
			}
			]
		}
		callSendAPI(sender_psid, response);
	}

	let order = payload.split('//');

	if (order[0] === 'LOC'){
		fs.readFile('umd_labeled.json', (err, umd) => {
			if (err) return console.log('Error loading client secret file:', err);
			// Authorize a client with credentials, then call the Google Sheets API.
			callSendAPI(sender_psid, make_res(JSON.parse(umd), order, sender_psid));
		});

		function make_res(umd, order, sender_psid){

	  		let depth = order.length;
	  		let current_page = order[depth - 1];
	  		
	  		let tmp_array;

	  		if (depth == 2){
	  			tmp_array = Object.keys(umd);
	  		} else if (depth == 4){
	  			tmp_array = Object.keys(umd[order[2]]);
	  		} else if (depth == 6){
	  			tmp_array = Object.keys(umd[order[2]][order[4]]);
	  		} else if (depth > 6){

	  			function f(data){
	  				
	  				let quick_replies = [
	  				{
		  				"content_type":"text",
		  				"title":"자세히",
		  				"payload":"DETAILS//" + order[2] + "//" + order[4] + "//" + order[6]
		  			},
	  				{
		  				"content_type":"text",
		  				"title":"관심지역 등록",
		  				"payload":"BOX//FAVOR//" + order[2] + "//" + order[4] + "//" + order[6]
		  			},
		  			{
		  				"content_type":"text",
		  				"title":"아침 알림 등록",
		  				"payload":"BOX//MORNING//" + order[2] + "//" + order[4] + "//" + order[6] + "//" + umd[order[2]][order[4]][order[6]]['MORNING'] 
		  			},
		  			{
		  				"content_type":"text",
		  				"title":"대기상태 변동 알림 등록",
		  				"payload":"BOX//CHANGE//" + order[2] + "//" + order[4] + "//" + order[6] + "//" + umd[order[2]][order[4]][order[6]]['CHANGE'] 
		  			}
		  			];

		  			function findmax(a,b,c){
		  				if(!a) return 0;
		  				if(!b) return 1;
		  				if(!c) return 2;
	  					a = a=='-' ? 0 : a ;
	  					b = b=='-' ? 0 : b ;
	  					c = c=='-' ? 0 : c ;
	  					if(a>=b && a>=c) return 0;
	  					else if (b>=c) return 1;
	  					else return 2;
	  				}

		  			let tmp_text;

		  			data = data.slice(0, Number(data[0][0])+1);
	  				let stationName = data.map(function(value,index) { return value[1]; });
	  				let stations = umd[order[2]][order[4]][order[6]]['cjs'];

	  				let tmp_status = [];
	  				let tmp_air = [];

	  				let tmp_index = [];
	  				tmp_index[0] = stationName.indexOf(stations[0]);

	  				if(tmp_index[0] == -1){
	  					tmp_air[0] = ["지원되지 않는 측정소", "지원되지 않는 측정소", "지원되지 않는 측정소", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "지원되지 않는 측정소", "0//0//0", "0//0//0"];
	  				}else {
	  					tmp_air[0] = data[tmp_index[0]]
	  				}

	  				if(tmp_air[0][3].split('//').length<3 && tmp_air[0][4].split('//').length<3 && tmp_air[0][5].split('//').length<3){
	  					tmp_text = order[6] + '의 대기오염 상태는\n8단계중 *' + tmp_air[0][11].split('//')[0] + '단계* 입니다!\n' + tmp_air[0][1] + ' 측정소\n' + tmp_air[0][2] + '시 기준';
	  					return {
	  						"text": tmp_text,
	  						"quick_replies":quick_replies
	  					};
	  				}else{
	  					tmp_index[1] = stationName.indexOf(stations[1]);

	  					if(tmp_index[1] == -1){
	  						tmp_air[1] = ["지원되지 않는 측정소", "지원되지 않는 측정소", "지원되지 않는 측정소", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "지원되지 않는 측정소", "0//0//0", "0//0//0"];
	  					}else {
	  						tmp_air[1] = data[tmp_index[1]]
	  					}

	  					tmp_index[2] = stationName.indexOf(stations[2]);

	  					if(tmp_index[2] == -1){
	  						tmp_air[2] = ["지원되지 않는 측정소", "지원되지 않는 측정소", "지원되지 않는 측정소", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "지원되지 않는 측정소", "0//0//0", "0//0//0"];
	  					}else {
	  						tmp_air[2] = data[tmp_index[2]]
	  					}
	  					
	  					if(tmp_air[0][3].split('//').length>2){
	  						if(tmp_air[1][3].split('//').length>2){
	  							tmp_status[0] = findmax(tmp_air[0][3].split('//')[2], tmp_air[1][3].split('//')[2], tmp_air[2][3].split('//')[2]);
	  						} else{
	  							tmp_status[0] = 1;
	  						}
	  					} else{
	  						tmp_status[0] = 0;
	  					}

	  					if(tmp_air[0][4].split('//').length>2){
	  						if(tmp_air[1][4].split('//').length>2){
	  							tmp_status[1] = findmax(tmp_air[0][4].split('//')[2], tmp_air[1][4].split('//')[2], tmp_air[2][4].split('//')[2]);
	  						} else{
	  							tmp_status[1] = 1;
	  						}
	  					} else{
	  						tmp_status[1] = 0;
	  					}

	  					if(tmp_air[0][5].split('//').length>2){
	  						if(tmp_air[1][5].split('//').length>2){
	  							tmp_status[2] = findmax(tmp_air[0][5].split('//')[2], tmp_air[1][5].split('//')[2], tmp_air[2][5].split('//')[2]);
	  						} else{
	  							tmp_status[2] = 1;
	  						}
	  					} else{
	  						tmp_status[2] = 0;
	  					}

	  					tmp_status[0] = tmp_air[tmp_status[0]][3];
	  					tmp_status[1] = tmp_air[tmp_status[1]][4];
	  					tmp_status[2] = tmp_air[tmp_status[2]][5];

	  					tmp_text = order[6] + '의 대기오염 상태는\n8단계중 *' + tmp_status[findmax(tmp_status[0], tmp_status[1], tmp_status[2])].split('//')[0] + '단계* 입니다!\n------------------------------------\n*현재 최근접 측정소의 데이터 전송지연으로 근접 측정소 데이터를 반영해 제공합니다. 자세한 데이터는 [자세히] 버튼으로 확인하세요.';
	  					return {
	  						"text": tmp_text,
	  						"quick_replies":quick_replies
	  					};

	  				}








		  		}



		  		sp_read(sender_psid, SHEET_ID_2, 'C5:O', f);

		  		return {
		  			"text": "",
		  			"quick_replies": []
		  		};
		  	}

		  	let need_page =  Math.ceil(tmp_array.length/9);
	  		let start_pt = (current_page - 1)*9;
	  		let end_pt = (current_page != need_page) ? start_pt+9 : tmp_array.length;

	  		console.log('start_pt is ' + start_pt);
	  		console.log('end_pt is ' + end_pt);

	  		let quick_replies = [];
	  		for (var i = start_pt; i < end_pt; i++ ){
	  			let tmp = {
	  				"content_type":"text",
	  				"title":tmp_array[i],
	  				"payload":payload + "//" + tmp_array[i] + "//1" 
	  			}
	  			quick_replies = quick_replies.concat(tmp);
	  		}

	  		if (depth != 2){

	  			let tmp_order;
				let tmp_payload;
			
				if(current_page != 1){
					tmp_order = order.slice(0, depth-1);
					tmp_payload = tmp_order.join('//') + '//' + (Number(current_page)-1);
				} else{
					tmp_order = order.slice(0, depth-2);
					tmp_payload = tmp_order.join('//');
				}

				let tmp = {
					"content_type":"text",
					"title":"이전",
					"payload": tmp_payload 
				};
				quick_replies.splice(0, 0, tmp);
			
			} else {
				let tmp_payload;
				if(order[1] == 1){
					tmp_payload = 'PICK_ADD';
				} else {
					tmp_payload = 'LOC//1';					
				}
				let tmp = {
					"content_type":"text",
					"title":"이전",
					"payload": tmp_payload
				};
				quick_replies.splice(0, 0, tmp);				
			}

			if(current_page != need_page){
			
				let tmp_order = order.slice(0, depth-1);
				
				let tmp = {
					"content_type":"text",
					"title":"다음",
					"payload":tmp_order.join('//') + '//' + (1 + Number(current_page)) 
				}
				quick_replies = quick_replies.concat(tmp);
			}

			let tmp_text;

			if(depth < 3) tmp_text = "시/도를 선택해 주세요";
			else if(depth <5) tmp_text = order[2] + "의 \n시/군/구를 선택해 주세요";
			else tmp_text = order[2] + " " + order[4] + "의 \n읍/면/동을 선택해 주세요";

			return {
				"text": tmp_text,
				"quick_replies":quick_replies
			};
		}
	}

	if (order[0] === 'BOX'){
		let tmp_range;
		let tmp_range2;
		let tmp_range3;
		let section;
		let gooltip;
		let station;
		let cate_index;
		let cate_alpha;
		let cate_alpha2;
		let cate_alpha3;
		

		if (order[1] === 'FAVOR'){
			tmp_range = 'M10:M';
			tmp_range2 = 'N10';
			tmp_range3 = 'M10:N';
			section = '관심지역';
			gooltip = '앞으로 관심지역 대기정보에서 쉽게 확인하세요!';
			station = order[4] + '이 ';
			cate_index = 1;
			cate_alpha = 'N10';

		} else if(order[1] === 'MORNING'){
			tmp_range = 'R10:R';
			tmp_range2 = 'S10';
			tmp_range3 = 'R10:S';
			section = '아침알림';
			gooltip = '앞으로 아침마다 현재 대기상태를 메시지로 받아보세요! (아침 6~7시 사이에 가장 가까운 측정소 단위로 발송됩니다)';
			station = order[4] + '이 ';
			cate_index = 2;
			cate_alpha = 'O10';
			cate_alpha2 = 'R10:U';
			cate_alpha3 = 'T';

		} else {
			tmp_range = 'W10:W';
			tmp_range2 = 'X10';
			tmp_range3 = 'W10:X';
			section = '대기상태 변동 알림';
			gooltip = '대기상태에 변동이 생길때마다 메시지로 확인 해보세요! (9:00AM ~ 8:00PM 사이 가장 가까운 측정소의 대기오염도 단계 변동시 발송됩니다)';
			station = order[4] + '이 ';
			cate_index = 3;
			cate_alpha = 'P10';
			cate_alpha2 = 'W10:Z';
			cate_alpha3 = 'Y';

		}

		function f(data){
			data = data.slice(0, Number(data[0][0])+1);
			let ID_list = data.map(function(value,index) { return value[0]; });
			let tmp_index = ID_list.indexOf(sender_psid);

			let quick_replies = [];

			//for append test
			//sp_write(sender_psid, SHEET_ID_3, tmp_range, [[sender_psid, order.slice(2).join('//')]]);

			if(order[5] && order[5] == '0000000000000000'){
				return {
					"text": "현재 제주의 일부 지역은 알림기능이 지원되지 않습니다ㅠㅜ 다른 지역을 이용해 주세용\n---------------------------------\n현재 지원되지 않는 지역: 이도일동, 이호이동, 이호일동, 일도이동, 일도일동, 조천읍, 추자면, 한경면, 한림읍, 해안동, 화북이동, 화북일동, 회천동"
				};
			}


			if (tmp_index == -1){

				if(order[5]){
					callLabelingAPI(sender_psid, order, cate_alpha2, cate_alpha3);

				}
				
				let tmp_cell = [[sender_psid, "", "", ""]];
				tmp_cell[0][cate_index] = order.slice(2).join('//');

				sp_write(sender_psid, SHEET_ID_3, 'M10:M', tmp_cell);
				sp_write2(sender_psid, SHEET_ID_3, 'M10', [[Number(data[0][0])+1]]);
				sp_write2(sender_psid, SHEET_ID_3, cate_alpha, [[Number(data[0][cate_index])+1]]);
			} else{
				if(!data[tmp_index][cate_index]) data[tmp_index][cate_index] = "" ;

				if(data[tmp_index][cate_index].split('@').indexOf(order.slice(2).join('//')) != -1) {

					if(order[5]){
						callLabelingAPI(sender_psid, order, cate_alpha2, cate_alpha3);
					}
					return {
						"text": station + "이미 " + section + "에 등록되어있습니다!"
					};
				} 

				if(order[5]){
					callLabelingAPI(sender_psid, order, cate_alpha2, cate_alpha3);

				}

				let seperator = (data[tmp_index][cate_index] == "") ? "" : "@";
				sp_write2(sender_psid, SHEET_ID_3, cate_alpha[0] + (tmp_index + 10), [[data[tmp_index][cate_index] + seperator + order.slice(2).join('//')]]);
				if(seperator == "") sp_write2(sender_psid, SHEET_ID_3, cate_alpha, [[Number(data[0][cate_index])+1]]);
			}


			return {
				"text": station + section + "에 등록되었습니다!" 
			};
		}

		sp_read(sender_psid, SHEET_ID_3, 'M10:P', f);
		callSendAPI(sender_psid, {"text": gooltip});
		
	}

	if(order[0] === 'MY' || order[0] === 'MY_DEL'){
		if(order[1] === 'FAVOR'){
			function f(data){
				data = data.slice(0, Number(data[0][0])+1);
				let ID_list = data.map(function(value,index) { return value[0]; });
				let tmp_index = ID_list.indexOf(sender_psid);

				if (tmp_index == -1){
					return {
						"text": "등록된 관심지역이 없어요.. \n관심지역을 등록하면 관심지역 대기정보에서 쉽게 확인할 수 있습니다!"
					};
				} else{

					if(!data[tmp_index][1]) data[tmp_index][1] = "" ;

					if(data[tmp_index][1] == ""){
						return {
							"text": "등록된 관심지역이 없어요.. \n관심지역을 등록하면 관심지역 대기정보에서 쉽게 확인할 수 있습니다!"
						};
					} else{

						let current_page = Number(order[2]);
						let tmp_array = data[tmp_index][1].split('@');

						let need_page =  Math.ceil(tmp_array.length/9);
						let start_pt = (current_page - 1)*9;
						let end_pt = (current_page != need_page) ? start_pt+9 : tmp_array.length;

						let quick_replies = [];

						for (var i = start_pt; i < end_pt; i++ ){
							let tmp_region = tmp_array[i].split('//');
							let tmp_payload;

							if(order[0] === 'MY') tmp_payload = "LOC//1//" + tmp_region[0] + "//1//" + tmp_region[1] + "//1//" + tmp_region[2];
							else tmp_payload = "DELETE//FAVOR//" + tmp_region[0] + "//" + tmp_region[1] + "//" + tmp_region[2];
							
							let tmp = {
								"content_type":"text",
								"title":tmp_region[2],
								"payload": tmp_payload 
							}
							quick_replies = quick_replies.concat(tmp);
						}

						if (current_page != 1){

				  			let tmp = {
								"content_type":"text",
								"title":"이전",
								"payload": order[0] + '//' + order[1] + '//' + Number(current_page-1)
							};
							quick_replies.splice(0, 0, tmp);
						}
						

						if(current_page != need_page){
							
							let tmp = {
								"content_type":"text",
								"title":"다음",
								"payload": order[0] + '//' + order[1] + '//' + Number(current_page+1) 
							}
							quick_replies = quick_replies.concat(tmp);
						}

						let tmp_text;
						
						if(order[0] === 'MY') tmp_text = "어떤 지역을 보고싶어요?";
						else tmp_text = "어떤 지역을 삭제할래요?";

						return {
							"text": tmp_text,
							"quick_replies":quick_replies
						};


					}

				}
			}
			sp_read(sender_psid, SHEET_ID_3, 'M10:N', f);
		
		} else if(order[1] === 'MORNING' || order[1] === 'CHANGE'){
			let tmp_range;
			let section;
			let section2;
			let cate_index;
			let cate_alpha;
			let gooltip;

			if (order[1] === 'MORNING'){
				
				section = '아침알림 지역';
				section2 = 'MORNING';
				tmp_range = 'R10:S';
				cate_index = 2;
				cate_alpha = 'O';
				gooltip = '아침마다 현재 대기상태를 메시지로 받아볼 수 있습니다!';

			}else{
				
				section = '대기상태 변동 알림 지역';
				section2 = 'CHANGE';
				tmp_range = 'W10:X';
				cate_index = 3;
				cate_alpha = 'P';
				gooltip = '대기상태에 변동이 생길때마다 메시지로 받아볼 수 있습니다!';

			}
			function f(data){
				data = data.slice(0, Number(data[0][0])+1);
				let ID_list = data.map(function(value,index) { return value[0]; });
				let tmp_index = ID_list.indexOf(sender_psid);


				if (tmp_index == -1){
					return {
						"text": "등록된 " + section + "이 없어요.. \n" + section + "을 등록하면 " + gooltip
					};
				} else{
					if(!data[tmp_index][cate_index] || data[tmp_index][cate_index] == ""){
						return {
							"text": "등록된 " + section + "이 없어요.. \n" + section + "을 등록하면 " + gooltip
						};
					} else{
						

						let current_page = Number(order[2]);
						let tmp_array = data[tmp_index][cate_index].split('@');

						let need_page =  Math.ceil(tmp_array.length/9);
						let start_pt = (current_page - 1)*9;
						let end_pt = (current_page != need_page) ? start_pt+9 : tmp_array.length;

						let quick_replies = [];

						for (var i = start_pt; i < end_pt; i++ ){
							let tmp_region = tmp_array[i].split('//');
							
							let tmp = {
								"content_type":"text",
								"title":tmp_region[2],
								"payload": "DELETE//" + section2 + "//" + tmp_region[0] + "//" + tmp_region[1] + "//" + tmp_region[2] + "//" + tmp_region[3] 
							}
							quick_replies = quick_replies.concat(tmp);
						}

						if (current_page != 1){

				  			let tmp = {
								"content_type":"text",
								"title":"이전",
								"payload": order[0] + '//' + order[1] + '//' + Number(current_page-1)
							};
							quick_replies.splice(0, 0, tmp);
						}
						

						if(current_page != need_page){
							
							let tmp = {
								"content_type":"text",
								"title":"다음",
								"payload": order[0] + '//' + order[1] + '//' + Number(current_page+1) 
							}
							quick_replies = quick_replies.concat(tmp);
						}

						let tmp_text;
						
						if(order[0] === 'MY') tmp_text = "어떤 지역을 보고싶어요?";
						else tmp_text = "어느 지역을 삭제할래요?";

						return {
							"text": tmp_text,
							"quick_replies":quick_replies
						};


					}

				}
			}
			sp_read(sender_psid, SHEET_ID_3, 'M10:P', f);
		}
	}

	if(order[0] === 'DELETE'){
		//let tmp_range;
		let tmp_range2;
		let tmp_range3;
		let section;
		//let gooltip;
		let station;
		let cate_index;
		let cate_alpha;
		let cate_alpha2;
		let cate_alpha3;

		if (order[1] === 'FAVOR'){
			
			tmp_range2 = 'N10';
			tmp_range3 = 'M10:N';
			section = '관심지역';
			
			station = order[4] + '이 ';
			cate_index = 1;
			cate_alpha = 'N';

		} else if(order[1] === 'MORNING'){
			
			tmp_range2 = 'S10';
			tmp_range3 = 'R10:S';
			section = '아침알림';
		
			station =  order[4] + "이 ";
			cate_index = 2;
			cate_alpha = 'O';
			cate_alpha2 = 'R10:U';
			cate_alpha3 = 'T';

		} else {
			
			tmp_range2 = 'X10';
			tmp_range3 = 'W10:X';
			section = '대기상태 변동 알림';
			
			station = order[4] + "이 ";
			cate_index = 3;
			cate_alpha = 'P';
			cate_alpha2 = 'W10:Z';
			cate_alpha3 = 'Y';

		}

		function f(data){
			data = data.slice(0, Number(data[0][0])+1);
			let ID_list = data.map(function(value,index) { return value[0]; });
			let tmp_index = ID_list.indexOf(sender_psid);

			let quick_replies = [];

			if(order[5]){
				callLabelingDelAPI(sender_psid, order[5]);

				function f2(data2){
					console.log('hey jude!!');
					data2 = data2.slice(0, Number(data2[0][0])+1);
					let label_list = data2.map(function(value,index) { return value[0]; });
					let tmp_index2 = label_list.indexOf(order[5]);
					if(tmp_index2 != -1){
						console.log('hey jude!!11');
						console.log(tmp_index2);

						let psid_list = data2[tmp_index2][3].split('//');	
						let tmp_index3 = psid_list.indexOf(sender_psid);

						if(tmp_index3 != -1){
							console.log('hey jude!!22');
							
							psid_list.splice(tmp_index3, 1);
							
							sp_write2(sender_psid, SHEET_ID_3, cate_alpha3 + (tmp_index2 + 10), [[Number(data2[tmp_index2][2]) - 1, psid_list.join('//')]]);
							sp_write2(sender_psid, SHEET_ID_3, cate_alpha3 + 10, [[Number(data2[0][2])-1]]);
						}

					} 

				}
				sp_read(sender_psid, SHEET_ID_3, cate_alpha2, f2);

			}

			if (tmp_index == -1){

				return {
					"text": station + section + "에서 삭제되었습니다"
				};
			} else{
				let tmp_index2 = data[tmp_index][cate_index].split('@').indexOf(order.slice(2).join('//'));
				if(tmp_index2 != -1) {

					let tmp_data = data[tmp_index][cate_index].split('@');
					tmp_data.splice(tmp_index2, 1);

					sp_write2(sender_psid, SHEET_ID_3, cate_alpha + (tmp_index + 10), [[tmp_data.join('@')]]);

					if(tmp_data.length == 0){
						sp_write2(sender_psid, SHEET_ID_3, cate_alpha + 10, [[Number(data[0][cate_index]) - 1]]);
					}

					return {
						"text": station + section + "에서 삭제되었습니다!"
					};
				}
				
				return {
					"text": station + section + "에서 이미 삭제되었습니다!"
				};
			}
		}
		sp_read(sender_psid, SHEET_ID_3, 'M10:P', f);
		
	}

	if(order[0] === 'SEARCH'){
		if(order[2] == 'message') return callSendAPI(sender_psid, {'text': '검색할 지역명을 메시지로 보내주세요!\n ex)동대문, 신촌, 강남 등'});
		addressKakaoAPI(sender_psid, order[1], Number(order[2]));
	}
	

	if(order[0] === 'DETAILS'){
		fs.readFile('umd_labeled.json', (err, umd) => {
			if (err) return console.log('Error loading client secret file:', err);
			// Authorize a client with credentials, then call the Google Sheets API.
			callSendAPI(sender_psid, make_res(JSON.parse(umd), order, sender_psid));
		});

		function make_res(umd, order, sender_psid){
			function f(data){

				let pollution = ['\n*[통합대기환경지수: ', '\n*[미세먼지: ', '\n*[초미세먼지: ', '\n*[아황산가스: ', '\n*[일산화탄소: ', '\n*[오존: ', '\n*[이산화질소: '];

				let tmp_text = '현재 ' + order[3] + ' 대기상태:'
				let quick_replies = [
				{
	  				"content_type":"text",
	  				"title":"관심지역 등록",
	  				"payload":"BOX//FAVOR//" + order[1] + "//" + order[2] + "//" + order[3]
	  			},
	  			{
	  				"content_type":"text",
	  				"title":"아침 알림 등록",
	  				"payload":"BOX//MORNING//" + order[1] + "//" + order[2] + "//" + order[3] + "//" + umd[order[1]][order[2]][order[3]]['MORNING']
	  			},
	  			{
	  				"content_type":"text",
	  				"title":"대기상태 변동 알림 등록",
	  				"payload":"BOX//CHANGE//" + order[1] + "//" + order[2] + "//" + order[3] + "//" + umd[order[1]][order[2]][order[3]]['CHANGE']
	  			}
	  			];

	  			data = data.slice(0, Number(data[0][0])+1);
	  			let stationName = data.map(function(value,index) { return value[1]; });
	  			let stations = umd[order[1]][order[2]][order[3]]['cjs'];

	  			function findmax(a,b,c){
	  				a = a=='-' ? 0 : a ;
	  				b = b=='-' ? 0 : b ;
  					c = c=='-' ? 0 : c ;
  					if(a>=b && a>=c){
  						if(a == 0) return -1;
  						else return 0;
  					} else if (b>=c){
  						return 1;
  					} else {
  						return 2;
  					}
  				}

  				let tmp_index;

	  			let tmp_status = [];
	  			for(let i = 0; i<7; i++){
	  				tmp_text += '\n---------------------------';
	  				tmp_text += pollution[i]; 

	  				tmp_index = stationName.indexOf(stations[0]);
	  				if(tmp_index == -1){
	  					tmp_status[0] = ["지원되지 않는 측정소", "지원되지 않는 측정소", "지원되지 않는 측정소", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "지원되지 않는 측정소", "0//0//0", "0//0//0"];
	  				} else if(data[tmp_index][i+3].split('//').length <= 2){
	  					tmp_text += data[tmp_index][i+3].split('//')[0] + '단계]*\n' + data[tmp_index][1] + '측정소(' + data[tmp_index][10] + ')\n' + data[tmp_index][2] + '시 기준';
	  					continue;
	  				} else{
	  					tmp_status[0] = data[tmp_index];
	  				}

	  				tmp_index = stationName.indexOf(stations[1]);
	  				if(tmp_index == -1){
	  					tmp_status[1] = ["지원되지 않는 측정소", "지원되지 않는 측정소", "지원되지 않는 측정소", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "지원되지 않는 측정소", "0//0//0", "0//0//0"];
	  				} else if(data[tmp_index][i+3].split('//').length <= 2){
	  					tmp_text += data[tmp_index][i+3].split('//')[0] + '단계]\n' + data[tmp_index][1] + '측정소(' + data[tmp_index][10] + ')\n' + data[tmp_index][2] + '시 기준';
	  					continue;
	  				} else{
	  					tmp_status[1] = data[tmp_index];
	  				}

	  				tmp_index = stationName.indexOf(stations[2]);
	  				if(tmp_index == -1){
	  					tmp_status[2] = ["지원되지 않는 측정소", "지원되지 않는 측정소", "지원되지 않는 측정소", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "0//0//0", "지원되지 않는 측정소", "0//0//0", "0//0//0"];
	  				} else if(data[tmp_index][i+3].split('//').length <= 2){
	  					tmp_text += data[tmp_index][i+3].split('//')[0] + '단계]\n' + data[tmp_index][1] + '측정소(' + data[tmp_index][10] + ')\n' + data[tmp_index][2] + '시 기준';
	  					continue;
	  				} else{
	  					tmp_status[2] = data[tmp_index];
	  				}

	  				tmp_index = findmax(tmp_status[0][i+3].split('//')[2], tmp_status[1][i+3].split('//')[2], tmp_status[2][i+3].split('//')[2]);

	  				if (tmp_index == -1) {
	  					tmp_text += '\n현재 해당 지역의 모든 근접 측정소 오류로 인해 알 수 없습니다]';
	  					continue;
	  				}

	  				let tmp_pollution = tmp_status[tmp_index][i+3].split('//');

	  				tmp_text += tmp_pollution[0] + '단계\n' + tmp_status[tmp_index][1] + '측정소(' + tmp_status[tmp_index][10] + ')\n' + tmp_pollution[2].slice(0,4) + '-' + tmp_pollution[2].slice(4,6) + '-' + tmp_pollution[2].slice(6,8) + ' ' + tmp_pollution[2].slice(8,10) + '시 기준';
	  				
	  				tmp_status = [];
	  			}

	  			tmp_text += '\n---------------------------\n*최근접 측정소의 최신 데이터만 진하게 표기됩니다!'

	  			return {
					"text": tmp_text,
					"quick_replies":quick_replies
				};

			}
			sp_read(sender_psid, SHEET_ID_2, 'C5:O', f);
		}
	}

	if(order[0] == 'NOT_TODAY'){
		if(!order[6]){
			callSendAPI(sender_psid, {
				"attachment":{
					"type":"template",
					"payload":{
						"template_type":"button",
						"text": '오늘은 알림 그만 받을래요?',
						"buttons":[
						{
							"type":"postback",
							"title":"성가신다. 그만해라.",
							"payload": "NOT_TODAY//" + order[1] + "//" + order[2] + "//" + order[3] + "//" + order[4] + "//" + order[5] + "//" + sender_psid
						},
						{
							"type":"postback",
							"title":"아니요~ 잘못눌렀어요!",
							"payload":"thanks2"
						}
						]
					}
				}
			});
		} else{
			function f(data){
				let exclusion_label = data[0][0];


				if(exclusion_label.length < 10){
					return {"text": "현재 알림 작동시간이 아니거나 알림 끄기 기능 오류 상태입니다ㅠㅜ 나중에 이용해 주세요"};
				} else{

					function f2(body){

						if(body.success == true){

							function f3(data3){

								let seperator = '//';

								if(!data3[data3.length-1][1])data3[data3.length-1][1] = ""
								if(data3[data3.length-1][1] == "") seperator = "";


								sp_write2(sender_psid, SHEET_ID_3, 'AG' + (data3.length + 8), [[data3[data3.length-1][1] + "//" + sender_psid]]);

								callSendAPI(sender_psid, {
									"attachment":{
										"type":"template",
										"payload":{
											"template_type":"button",
											"text": '그럼 이만 퇴근!\n내일 봐여~~\n헤헤',
											"buttons":[
											{
												"type":"postback",
												"title":"퇴근 취소하기^^!",
												"payload": "NOT_TODAY_NOT//" + order[1] + "//" + order[2] + "//" + order[3] + "//" + order[4] + "//" + order[5] + "//" + sender_psid
											}
											]
										}
									}
								});

							}
							sp_read(sender_psid, SHEET_ID_3, 'AF9:AG', f3);
				
							
						}else{
							callSendAPI(sender_psid, {"text": "서버 오류 발생.\n잠시 후에 다시 이용해 주세요"});
						}

					}
					callPurelyLabelingAPI(order[6], exclusion_label, f2);
				
				}

			}
			sp_read(sender_psid, SHEET_ID_3, 'X10', f);
		}

	}

	if(order[0] == 'NOT_TODAY_NOT'){
		function f(data){

			let exclusion_label = data[0][0];

			if (exclusion_label.length < 10){
				return {"text": "이미 퇴근 시간이 지난것 같아요^^!"};
			} else{
				callSendAPI(sender_psid, {"text": "와아 다시 출근.."});
				callLabelingDelAPI(order[6], exclusion_label);
			}

		}
		sp_read(sender_psid, SHEET_ID_3, 'X10', f);
		
	}






	// Send the message to acknowledge the postback
	//callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
	//Construct the message body
	let request_body = {
		"messaging_type": "RESPONSE",
		"recipient": {
			"id": sender_psid
		},
		"message": response
	}

	// Send the HTTP request to the Messenger Platform
	request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": PAGE_ACCESS_TOKEN },
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if (!err) {
			console.log('message sent!');
		} else {
			console.error("Unable to send message:" + err);
		}
	}); 
}

function callCoordinatesKakaoAPI(sender_psid, xCog, yCog, f) {
	//Construct the message body
	const KEY = 'XXXX';
	const options = {
		"uri": 'https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=' + xCog + '&y=' + yCog,
		"method": "GET",
		"headers": {
			'Authorization': KEY
		}
	};
	
	// Send the HTTP request to the Messenger Platform
	request(options, (err, res, body) => {
		if (!err) {
			console.log('I Got! its here')
			let json = JSON.parse(body);
			console.log(json);
			callSendAPI(sender_psid, f(json));
		} else {
			console.error("Unable to send message:" + err);
		}
	}); 
}

function callAddressKakaoAPI(sender_psid, search_word, f){
	const KEY = 'XXXX';
	search_word = querystring.stringify({query: search_word});
	const options = {
		"uri": "https://dapi.kakao.com/v2/local/search/address.json?size=30&" + search_word,
		"method": "GET",
		"headers": {
			'Authorization': KEY
		}
	};

	// Send the HTTP request to the Messenger Platform
	request(options, (err, res, body) => {
		if (!err) {
			console.log('I Got! here?');
			let json = JSON.parse(body);
			console.log(json);
			callSendAPI(sender_psid, f(json));
		} else {
			console.error("Unable to send message:" + err);
		}
	}); 
}

function addressKakaoAPI(sender_psid, search_word, current_page){

	fs.readFile('umd_labeled.json', (err, umd) => {
		if (err) return console.log('Error loading client secret file:', err);
		// Authorize a client with credentials, then call the Google Sheets API.

		callSendAPI(sender_psid, make_res(JSON.parse(umd), sender_psid));
	});

	function make_res(umd, sender_psid){

		function f(data){

			if(data.documents.length == 0) return {"text" : "검색 결과가 없습니다ㅠㅜ"};

			let need_page =  Math.ceil(data.documents.length/9);
			let start_pt = (current_page - 1)*9;
			let end_pt = (current_page != need_page) ? start_pt+9 : data.documents.length;

			let quick_replies = [];

			let sidoName = {서울: "서울특별시", 경기: "경기도", 인천: "인천광역시", 강원: "강원도", 충남: "충청남도", 충북: "충청북도", 세종특별자치시: "세종특별자치시", 세종: "세종특별자치시", 대전: "대전광역시", 경북: "경상북도", 대구: "대구광역시", 울산: "울산광역시", 경남: "경상남도", 부산: "부산광역시", 전북: "전라북도", 전남: "전라남도", 광주: "광주광역시", 제주특별자치도: "제주특별자치도", 제주: "제주특별자치도"};

			let payload_overlap_check =[];

			for (var i = start_pt; i < end_pt; i++ ){

				let tmp_payload;
				let address = data.documents[i].address;

				if(address == null) continue;

				address.region_1depth_name = sidoName[address.region_1depth_name];
				if(address.region_1depth_name == "세종특별자치시") address.region_2depth_name = "세종시";
				
				let h_name = address.region_3depth_h_name == "" || address.region_3depth_h_name == address.region_3depth_name || address.region_3depth_name == "" ? "" : "(" + address.region_3depth_h_name + ")";

				if(address.region_2depth_name != "" && !Boolean(umd[address.region_1depth_name][address.region_2depth_name]) ){
					for(let j=0; j < Object.keys(umd[address.region_1depth_name]).length; j++){
						
						let tmp_address = Object.keys(umd[address.region_1depth_name])[j];
						
						if(tmp_address.includes(address.region_2depth_name)) {
							
							if(address.region_3depth_name == ""){
								tmp_payload = "LOC//1//" + address.region_1depth_name + "//1//" + tmp_address + "//1";

								if (payload_overlap_check.indexOf(tmp_payload) != -1) {
									console.log("hey i'm here!");
									continue;
								}
								payload_overlap_check = payload_overlap_check.concat(tmp_payload);

								quick_replies = quick_replies.concat({
									"content_type":"text",
									"title":address.region_1depth_name + " " + tmp_address,
									"payload": tmp_payload
								});
							} else{
								if(Object.keys(umd[address.region_1depth_name][tmp_address]).includes(address.region_3depth_name)){

									tmp_payload = "LOC//1//" + address.region_1depth_name + "//1//" + tmp_address + "//1//"  + address.region_3depth_name + "//1";

									if (payload_overlap_check.indexOf(tmp_payload) != -1) {
										console.log("hey i'm here!");
										continue;
									}
									payload_overlap_check = payload_overlap_check.concat(tmp_payload);

									quick_replies = quick_replies.concat({
										"content_type":"text",
										"title":address.region_1depth_name + " " + tmp_address + " " + address.region_3depth_name + h_name,
										"payload": tmp_payload
									});
								}
								
							}


						}

					}
				}


				console.log('this is address now will begin ' + i);
				console.log(address.region_1depth_name + " " + address.region_2depth_name + " " + address.region_3depth_name + h_name);



				if(address.region_2depth_name == ''){
					if(!Boolean(umd[address.region_1depth_name]) /*&& Object.keys(umd[address.region_1depth_name]).length == 0 */ ) continue;
					tmp_payload = "LOC//1//" + address.region_1depth_name + "//1";
				} 
				else if(address.region_3depth_name == ''){
					if(!Boolean(umd[address.region_1depth_name][address.region_2depth_name]) /* && Object.keys(umd[address.region_1depth_name][address.region_2depth_name]).length == 0*/ ) continue;
					tmp_payload = "LOC//1//" + address.region_1depth_name + "//1//" + address.region_2depth_name + "//1";
				} 
				else {
					if(!Boolean(umd[address.region_1depth_name][address.region_2depth_name]) || !Boolean(umd[address.region_1depth_name][address.region_2depth_name][address.region_3depth_name]) /* && Object.keys(umd[address.region_1depth_name][address.region_2depth_name][address.region_3depth_name]).length == 0*/ ) continue;
					tmp_payload = "LOC//1//" + address.region_1depth_name + "//1//" + address.region_2depth_name + "//1//" + address.region_3depth_name + "//1"
				}

				if (payload_overlap_check.indexOf(tmp_payload) != -1) {
					console.log("hey i'm here!");
					continue;
				}
				payload_overlap_check = payload_overlap_check.concat(tmp_payload);

				let tmp = {
					"content_type":"text",
					"title":address.region_1depth_name + " " + address.region_2depth_name + " " + address.region_3depth_name + h_name,
					"payload": tmp_payload 
				}
				quick_replies = quick_replies.concat(tmp);
			}
			console.log("here is overlap check"); 
			console.log(payload_overlap_check);

			if(quick_replies.length == 0) return {"text" : "검색 결과가 없습니다ㅠㅜ"};

			if (current_page != 1){
				let tmp = {
					"content_type":"text",
					"title":"이전",
					"payload": "SEARCH" + '//' + search_word + '//' + Number(current_page-1)
				};
				quick_replies.splice(0, 0, tmp);
			}
			

			if(current_page != need_page){
				
				let tmp = {
					"content_type":"text",
					"title":"다음",
					"payload": "SEARCH" + '//' + search_word + '//' + Number(current_page+1) 
				}
				quick_replies = quick_replies.concat(tmp);
			}

			return {
				"text" : search_word + " 검색 결과입니다",
				"quick_replies":quick_replies
			};

		}

		callAddressKakaoAPI(sender_psid, search_word, f);
	}

}


function callLabelingAPI(sender_psid, order, cate_alpha2, cate_alpha3){
	//Construct the message body
	let request_body = {
		"user": sender_psid
	};

	let options = {
		"uri": "https://graph.facebook.com/v2.11/" + order[5] + "/label",
		"qs": { "access_token": PAGE_ACCESS_TOKEN },
		"method": "POST",
		"json": request_body
	}

	// Send the HTTP request to the Messenger Platform
	request(options, (err, res, body) => {
		if (!err) {
			console.log('labeled!');
			//console.log(body);
			//console.log(body.success);
			if(body.success == true){
				callSendAPI(sender_psid, {"text": "^^!"});
				//return true;

				function f2(data2){
					console.log('hey jude!');
					data2 = data2.slice(0, Number(data2[0][0])+1);
					let label_list = data2.map(function(value,index) { return value[0]; });
					let tmp_index2 = label_list.indexOf(order[5]);
					if(tmp_index2 == -1){
						console.log('hey jude!11');
						sp_write(sender_psid, SHEET_ID_3, cate_alpha2.slice(0,4) + cate_alpha2[0], [[order[5], order.slice(2).join('//'), 1, sender_psid]]);
						console.log('hey jude!12');
						sp_write2(sender_psid, SHEET_ID_3, cate_alpha2.slice(0,3), [[Number(data2[0][0])+1]]);
						sp_write2(sender_psid, SHEET_ID_3, cate_alpha3 + 10, [[Number(data2[0][2])+1]]);
					} else{
						console.log('hey jude!22');
						let seperator = '//';
						if(data2[tmp_index2][2] == 0){
							data2[tmp_index2][3] = "" ;
							seperator = '';
						}

						if(data2[tmp_index2][3].split('//').indexOf(sender_psid) == -1){
							sp_write2(sender_psid, SHEET_ID_3, cate_alpha3 + (tmp_index2 + 10), [[Number(data2[tmp_index2][2]) + 1, data2[tmp_index2][3] + seperator + sender_psid]]);
							sp_write2(sender_psid, SHEET_ID_3, cate_alpha3 + 10, [[Number(data2[0][2])+1]]);
						}

					}

				}
				sp_read(sender_psid, SHEET_ID_3, cate_alpha2, f2);
			
			}else{
				callSendAPI(sender_psid, {"text": "서버 등록에 오류가 발생했습니다.\n등록 삭제후 다시 등록해주세요ㅠㅜ"});
			}
			

		} else {
			console.error("Unable to label:" + err);
			callSendAPI(sender_psid, {"text": "서버 등록에 오류가 발생했습니다.\n등록 삭제후 다시 등록해주세요ㅠㅜ"});
		}
	});
}

function callPurelyLabelingAPI(sender_psid, custom_label_id, f){
	//Construct the message body

	let request_body = {
		"user": sender_psid
	};

	let options = {
		"uri": "https://graph.facebook.com/v2.11/" + custom_label_id + "/label",
		"qs": { "access_token": PAGE_ACCESS_TOKEN },
		"method": "POST",
		"json": request_body
	}

	//Send the HTTP request to the Messenger Platform
	request(options, (err, res, body) => {
		if (!err) {
			console.log('made exclusion label!');
			console.log(body);
			//let json = JSON.parse(body);
			//console.log(json);
			f(body);

		} else {
			console.error("Unable to enroll to label:" + err);
			callSendAPI(sender_psid, {"text": "서버 오류 발생.\n잠시 후에 다시 이용해 주세요"});
		}
	});
}

function callLabelingDelAPI(sender_psid, label_id){
	//Construct the message body

	let options = {
		"uri": "https://graph.facebook.com/v2.11/" + label_id + "/label?user=" + sender_psid,
		"qs": { "access_token": PAGE_ACCESS_TOKEN },
		"method": "DELETE"
	}

	// Send the HTTP request to the Messenger Platform
	request(options, (err, res, body) => {
		if (!err) {
			console.log('label deleted!');
			console.log(body);
			let json = JSON.parse(body);
			console.log(json);
			if(json.success == true){
				callSendAPI(sender_psid, {"text": "^^!"});
			}else{
				callSendAPI(sender_psid, {"text": "서버 오류가 발생했습니다.\n등록후 다시 삭제해주세요ㅠㅜ"});
			}
		} else {
			console.error("Unable to delete label:" + err);
			callSendAPI(sender_psid, {"text": "서버 오류가 발생했습니다.\n등록후 다시 삭제해주세요ㅠㅜ"});
		}
	});
}

function callVisionKakaoAPI(sender_psid, image_url, f){
	const KEY = 'XXXX';
	//search_word = querystring.stringify({query: search_word});
	const options = {
		"uri": "https://kapi.kakao.com/v1/vision/multitag/generate?image_url=" + image_url,
		"method": "POST",
		"headers": {
			'Authorization': KEY
		}
	};

	// Send the HTTP request to the Messenger Platform
	request(options, (err, res, body) => {
		if (!err) {
			console.log('I Got! here?');
			let json = JSON.parse(body);
			console.log(json);
			callSendAPI(sender_psid, f(json));
		} else {
			console.error("Unable to send message:" + err);
		}
	});
}

///////////GOOGLE APIS/////////////GOOGLE APIS///////////GOOGLE APIS//////////GOOGLE APIS////////GOOGLE APIS///////

//const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'credentials.json';

/////sp_read/////////sp_read/////////sp_read///////sp_read//////sp_read
function sp_read(sender_psid, sheetId, range, f) {

  // Load client secrets from a local file.
  fs.readFile('client_secret.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listMajors);
  });
  

  /**
   * Prints the names and majors of students in a sample spreadsheet:
   * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   */
  function listMajors(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    }, (err, {data}) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = data.values;
      if (rows.length) {
        /*
        console.log('오늘의 날씨는');
        console.log(`${rows[0][0]}입니다.`);
        console.log('오늘의 기온은');
        console.log(`${rows[1][0]}입니다.`);
        console.log(rows[Number(cogn[0])-1][Number(cogn[1])-1].toString());
        console.log(okok.message);
        okok.message = rows[Number(cogn[0])-1][Number(cogn[1])-1].toString();
        console.log(okok.message);
        */
        //haha = rows[Number(cogn[0])-1][Number(cogn[1])-1].toString();
        callSendAPI(sender_psid, f(rows));


      } else {
        console.log('No data found.');
      }
    });
  }
}


function t_tran(t) {
	if (t instanceof Date) {
		var trand = '';
		trand += (t.getMonth()+1) + "/" + t.getDate() + " - " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() + "." + t.getMilliseconds() + "-" + t.getFullYear(); 
		return trand;
	} else return t;
}

/////sp_write//////////sp_write//////////sp_write/////sp_write////////
function sp_write(sender_psid, sheetId, range, values) {

  // Load client secrets from a local file.
  fs.readFile('client_secret.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listMajors);
  });

  /**
   * Prints the names and majors of students in a sample spreadsheet:
   * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   */
  function listMajors(auth) {
    const sheets = google.sheets({version: 'v4', auth});

    //Write sheet values here
    //var values = [[t_tran(new Date()), sender_psid],[]];
    var body = {
      values: values
    };

    sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'RAW',
      //valueInputOption: 'USER_ENTERED'
      //insertDataOption: 'INSERT_ROWS',
      resource: body,
    }, function (err, result) {
      if (err) {
        return console.log('The API returned an error: ' + err);
      } else{
      	console.log("This is result");
      	//console.log(result);
        console.log(`${result.updatedCells} cells updated.`);
        //res.send('cells updated!');
      }
      
    });

  }
}


function sp_write2(sender_psid, sheetId, range, values) {

  // Load client secrets from a local file.
  fs.readFile('client_secret.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listMajors);
  });

  /**
   * Prints the names and majors of students in a sample spreadsheet:
   * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   */
  function listMajors(auth) {
    const sheets = google.sheets({version: 'v4', auth});

    //Write sheet values here
    //var values = [[t_tran(new Date()), sender_psid],[]];
    
    var body = {
      values: values
    };
    

    sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'RAW',
      //valueInputOption: 'USER_ENTERED'
      //insertDataOption: 'INSERT_ROWS',
      resource: body,
      //values: values
    }, function (err, result) {
      if (err) {
        return console.log('The API returned an error: ' + err);
      } else{
      	console.log("This is result");
      	//console.log(result);
        console.log(`${result.updatedCells} cells updated.`);
        //res.send('cells updated!');
      }
      
    });

  }
}


////////Auth functions////////Auth functions////////Auth functions////////Auth functions////////////

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
* Get and store new token after prompting for user authorization, and then
* execute the given callback with the authorized OAuth2 client.
* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
* @param {getEventsCallback} callback The callback for the authorized client.
*/
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

